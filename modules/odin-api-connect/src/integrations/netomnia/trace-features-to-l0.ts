import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

let tempCables = [];

let tempClosures = [];

const cableTypes = [
  {
    name: 'Feed',
    from: 'L4',
    to: 'L3',
  },
  {
    name: 'Access',
    from: 'L3',
    to: 'L2',
  },
  {
    name: 'Distribution',
    from: 'L2',
    to: 'L1',
  },
  {
    name: 'Spine',
    from: 'L1',
    to: 'L0',
  },
]

let data = [];

let ignoreList = {
  closures: [],
  cables: [],
}


let cosmosProdDb: any = null;

async function sync() {

  const httpClient = new BaseHttpClient();

  try {
    cosmosProdDb = await createConnection({
      type: 'postgres',
      name: 'netomniaConnection',
      host: process.env.DB_GIS_HOSTNAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_GIS_USERNAME,
      password: process.env.DB_GIS_PASSWORD,
      database: process.env.DB_GIS_NAME,
      synchronize: false,
      entities: [],
    });
  } catch (e) {
    console.error(e);
  }
}

sync().then(
  resp => {
    getInitialFeature('closure', 2444);
  },
);

async function getInitialFeature(feature, id) {
  switch (feature) {
    case 'closure':
      const start = new Date().getTime()
      const trace = await getInitialClosure(id)
      console.log(trace, new Date().getTime() - start);
      break;
    case 'cable':
      getInitialCable(id);
      break;
  }
}

function filterDuplicates(arr) {
  const unique = [];
  const foundClosures = [];
  const foundCables = [];

  arr.forEach(
    element => {
      if(element.closure_id) {
        if(foundClosures.indexOf(element.closure_id) === -1) {
          unique.push(element)
          foundClosures.push(element.closure_id)
        }
      }
      if(element.cable_id) {
        if(foundCables.indexOf(element.cable_id) === -1) {
          unique.push(element)
          foundCables.push(element.cable_id);
        }
      }
    },
  )

  return unique;
}

async function getInitialClosure(id) {
  const query = `
        SELECT closure.geometry as closure_geometry, closure.id as closure_id, closure_type.name as closure_type_name
        FROM ftth.closure as closure
        RIGHT JOIN ftth.closure_type AS closure_type ON (closure.type_id = closure_type.id)
        WHERE closure.id = ${id}
    `

  const initClosure = await cosmosProdDb.query(query);
  const type = initClosure[0].closure_type_name;
  ignoreList.closures.push(initClosure[0].closure_id);
  data.push(initClosure[0]);

  return await getCables(id, type)
}

async function getInitialCable(id) {

}

async function getCables(id, type) {
  const cableType = getCableType(type);
  if(!cableType) {
    return data;
  }
  const query = `
    SELECT
        cable.id AS cable_id,
        cable.geometry AS cable_geometry,
        cable.type_id AS cable_type_id,
        cable_type.name AS cable_type_name
    FROM
        ftth.closure as closure, ftth.cable AS cable
        RIGHT JOIN ftth.cable_type AS cable_type ON (cable.type_id = cable_type.id AND cable_type.name = '${cableType.name}')
    WHERE
        ST_Intersects(closure.geometry,
            CASE
                WHEN ST_GeometryType(cable.geometry) <> 'ST_MultiCurve'
                    THEN cable.geometry
                WHEN ST_GeometryType(cable.geometry) = 'ST_MultiCurve'
                    THEN ST_CurveToLine(cable.geometry)
            END
        )
    AND closure.id = ${id} ${ignoreList.cables.length ? 'AND cable.id NOT IN ' + '(' + ignoreList.cables.join() + ')' : ''}
    `;

  const cables = await cosmosProdDb.query(query);
  if(cables.length > 1) {
    for(let cable of cables) {
      cable.from_closure = id
      data.push(cable);
      ignoreList.cables.push(cable.cable_id)
      await getClosures(cable.cable_id, cableType.to)
    }
  } else if(cables.length > 0) {
    cables[0].from_closure = id;
    data.push(cables[0]);
    ignoreList.cables.push(cables[0].cable_id);
    await getClosures(cables[0].cable_id, cableType.to)
  }
}

function getCableType(type) {
  const cableType = cableTypes.find(e => e.from == type);
  return cableType;
}

function getCableTypeReverse(type) {
  const cableType = cableTypes.find(e => e.to == type);
  return cableType;
}

async function getClosures(id, type) {
  const query = `
    SELECT
        closure.geometry as closure_geometry, closure.id as closure_id, closure_type.name as closure_type_name
    FROM
        ftth.cable AS cable, ftth.closure as closure
        RIGHT JOIN ftth.closure_type AS closure_type  ON (closure_type.id = closure.type_id AND closure_type.name = '${type}')
    WHERE
        ST_Intersects(
            closure.geometry,
            CASE
                WHEN ST_GeometryType(cable.geometry) <> 'ST_MultiCurve'
                    THEN cable.geometry
                WHEN ST_GeometryType(cable.geometry) = 'ST_MultiCurve'
                    THEN ST_CurveToLine(cable.geometry)
            END
        )
        AND cable.id IN (${id}) ${ignoreList.closures.length ? 'AND closure.id NOT IN ' + '(' + ignoreList.closures.join() + ')' : ''};`

  const closures = await cosmosProdDb.query(query)
  if(closures.length === 0) {
    const backStep = getCableTypeReverse(type);
    if(backStep) {
      await getClosures(id, backStep.from)
    }
  } else {
    if(type !== 'L0') {
      ignoreList.closures.push(closures[0].closure_id)
      closures[0].from_cable = id;
      data.push(closures[0]);
      await getCables(closures[0].closure_id, type)
    } else {
      closures[0].from_cable = id;
      data.push(closures[0]);
      const uniqueData = filterDuplicates(data);
      return uniqueData;
    }
  }
}

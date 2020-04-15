import * as dotenv from 'dotenv';
import * as fs from 'fs';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

dotenv.config({ path: '../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

let data = [];

let ignoreList = [];

async function sync() {

  const pg = await createConnection({
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
  const startOffset = 0;
  const offsetLimit = 50;
  let hasMore = true;
  let offset = startOffset ? Number(startOffset) : 0;
  let limit = offsetLimit ? Number(offsetLimit) : 50;


  while (hasMore) {

    data = [];
    // fetch results
    const results = await pg.query(`
            SELECT closures.id as closure_id \
            FROM ftth.closure as closures \
            WHERE closures.id IS NOT NULL AND closures.type_id IN (4,5)\
            LIMIT ${limit} OFFSET ${offset}`);
    // end if limit is reached
    if(results.length < 1) {
      hasMore = false;
      break;
    }
    for(const closure_id of results) {

      // console.log(closure_id.closure_id, new Date().toISOString());

      const clo_id = closure_id.closure_id;

      console.log('NEW CLOSURE', closure_id, new Date().toISOString());

      await funcQuery_1(clo_id, pg);


    }
    offset = offset + limit;
    console.log('NEXT BATCH', offset);

    for(let row of data) {
      const insertClosuresCables = `
                INSERT INTO ftth.trace_closures_cables (closure_id, chamber_id, cable_id, direction, seal_interface_id, is_loop)
                VALUES (${row.closure}, NULL, ${row.cable}, '${row.direction}', ${row.seal_interface}, ${row.is_loop})
            `;
      await pg.query(insertClosuresCables);

    }

    fs.writeFileSync('./allData.json', JSON.stringify(data));

  }
}

sync();

async function funcQuery_1(id, pg, prev_id?, branch?) {

  const query_primary = `
    -- Query 1: Get cable connecting two closures by closure id
    -- Direction: closure -> port -> seal_interface -> cable
    select
        closure.id as closure_id,
        closure_type.name as closure_type_name,
        seal_interface.id as seal_interface_id,
        seal_interface.cable_id as seal_interface_cable_id,
        seal_interface.direction as seal_interface_direction
    from ftth.closure as closure
    -- 	ftth.splitter as splitter on splitter.id = connection.splitter_id
    left join ftth.closure_type as closure_type on (closure_type.id = closure.type_id)
    left join ftth.port as port on (port.closure_id = closure.id)
    left join ftth.seal_interface as seal_interface ON (seal_interface.port_id = port.id)
    left join ftth.chamber as chamber ON (port.chamber_id = chamber.id)
    left join ftth.cable as cable ON (seal_interface.cable_id = cable.id)
    left join ftth.cable_type as cable_type on (cable_type.id = cable.type_id)
    where closure.id = ${id}
    and (
        (closure_type.name = 'L4' and cable_type.name = 'Feed')
        or
        (closure_type.name = 'L3' and cable_type.name = 'Access')
        or
        (closure_type.name = 'L2' and cable_type.name = 'Distribution')
        or
        (closure_type.name = 'L1' and cable_type.name = 'Spine')
    )
    and seal_interface.direction = 'In'
    ${ignoreList.length ? 'AND seal_interface.id NOT IN (' + ignoreList.join() + ')' : ''};
    `

  /*
   and (
   case
   when closure_type.name = 'L4'
   then cable_type.name = 'Drop'
   when closure_type.name = 'L3'
   then cable_type.name = 'Feed'
   when closure_type.name = 'L2'
   then cable_type.name = 'Access'
   when closure_type.name = 'L1'
   then cable_type.name = 'Distribution'
   when closure_type.name = 'L0'
   then cable_type.name = 'Spine'
   end
   )
   */
  const part_1 = await pg.query(query_primary);

  // console.log(part_1);

  if(part_1.length > 1) {
    for(let item of part_1) {
      if(item.cable_id !== prev_id) {
        const base = {
          closure: item.closure_id,
          direction: item.seal_interface_direction,
          cable: item.seal_interface_cable_id,
          seal_interface: item.seal_interface_id,
          is_loop: false,
        }
        data.push(base);

        ignoreList.push(item.seal_interface_id)
        await funcQuery_2(part_1[0].seal_interface_cable_id, pg, id);
      }
    }
  } else if(part_1.length > 0) {
    const base = {
      closure: part_1[0].closure_id,
      direction: part_1[0].seal_interface_direction,
      cable: part_1[0].seal_interface_cable_id,
      seal_interface: part_1[0].seal_interface_id,
      is_loop: false,
    }
    data.push(base);

    ignoreList.push(part_1[0].seal_interface_id)
    await funcQuery_2(part_1[0].seal_interface_cable_id, pg, id);
  } else {

    const query_secondary = `
        -- Query 1: Get cable connecting two closures by closure id
        -- Direction: closure -> port -> seal_interface -> cable
        select
            closure.id as closure_id,
            closure_type.name as closure_type_name,
            seal_interface.id as seal_interface_id,
            seal_interface.cable_id as seal_interface_cable_id,
            seal_interface.direction as seal_interface_direction
        from ftth.closure as closure
        -- 	ftth.splitter as splitter on splitter.id = connection.splitter_id
        left join ftth.closure_type as closure_type on (closure_type.id = closure.type_id)
        left join ftth.port as port on (port.closure_id = closure.id)
        left join ftth.seal_interface as seal_interface ON (seal_interface.port_id = port.id)
        left join ftth.chamber as chamber ON (port.chamber_id = chamber.id)
        left join ftth.cable as cable ON (seal_interface.cable_id = cable.id)
        left join ftth.cable_type as cable_type on (cable_type.id = cable.type_id)
        where closure.id = ${id}
        and (
            (closure_type.name = 'L3' and cable_type.name = 'Feed')
            or
            (closure_type.name = 'L2' and cable_type.name = 'Access')
            or
            (closure_type.name = 'L1' and cable_type.name = 'Distribution')
            or
            (closure_type.name = 'L0' and cable_type.name = 'Spine')
        )
        and seal_interface.direction = 'In'
        ${ignoreList.length ? 'AND seal_interface.id NOT IN (' + ignoreList.join() + ')' : ''};
        `

    const part_2 = await pg.query(query_primary);

    if(part_2.length > 1) {
      for(let item of part_2) {
        if(item.cable_id !== prev_id) {
          const base = {
            closure: item.closure_id,
            direction: item.seal_interface_direction,
            cable: item.seal_interface_cable_id,
            seal_interface: item.seal_interface_id,
            is_loop: false,
          }
          data.push(base);

          ignoreList.push(item.seal_interface_id)
          await funcQuery_2(part_1[0].seal_interface_cable_id, pg, id);
        }
      }
    } else if(part_2.length > 0) {
      const base = {
        closure: part_2[0].closure_id,
        direction: part_2[0].seal_interface_direction,
        cable: part_2[0].seal_interface_cable_id,
        seal_interface: part_2[0].seal_interface_id,
        is_loop: false,
      }
      data.push(base);

      ignoreList.push(part_2[0].seal_interface_id)
      await funcQuery_2(part_2[0].seal_interface_cable_id, pg, id);
    } else {
      return
    }
  }
}

async function funcQuery_2(id, pg, prevId, branch?) {

  const query_primary = `
            select
            closure.id as closure_id,
            seal_interface.id as seal_interface_id,
            seal_interface.cable_id as seal_interface_cable_id,
            seal_interface.direction as seal_interface_direction
        from
            ftth.seal_interface as seal_interface
        left join ftth.port as port on (seal_interface.port_id = port.id)
        left join ftth.closure as closure on (port.closure_id = closure.id)
        left join ftth.closure_type as closure_type on (closure_type.id = closure.type_id)
        left join ftth.cable as cable ON (seal_interface.cable_id = cable.id)
        left join ftth.cable_type as cable_type on (cable_type.id = cable.type_id)
        where seal_interface.cable_id = ${id}
        and (
            (closure_type.name = 'L3' and cable_type.name = 'Feed')
            or
            (closure_type.name = 'L2' and cable_type.name = 'Access')
            or
            (closure_type.name = 'L1' and cable_type.name = 'Distribution')
            or
            (closure_type.name = 'L0' and cable_type.name = 'Spine')
        )
        and seal_interface.direction = 'Out'
        ${ignoreList.length ? 'AND seal_interface.id NOT IN (' + ignoreList.join() + ')' : ''}
        `
  const part_1 = await pg.query(query_primary);

  if(part_1.length > 1) {
    for(let item of part_1) {
      if(prevId !== item.closure_id) {
        const base = {
          closure: item.closure_id,
          direction: item.seal_interface_direction,
          cable: item.seal_interface_cable_id,
          seal_interface: item.seal_interface_id,
          is_loop: false,
        }
        data.push(base);

        ignoreList.push(item.seal_interface_id)
        await funcQuery_1(item.closure_id, pg);
      }
    }
  } else if(part_1.length > 0) {
    const base = {
      closure: part_1[0].closure_id,
      direction: part_1[0].seal_interface_direction,
      cable: part_1[0].seal_interface_cable_id,
      seal_interface: part_1[0].seal_interface_id,
      is_loop: false,
    }
    data.push(base);

    ignoreList.push(part_1[0].seal_interface_id)
    await funcQuery_1(part_1[0].closure_id, pg, id);
  } else {
    const query_secondary = `
            select
            closure.id as closure_id,
            seal_interface.id as seal_interface_id,
            seal_interface.cable_id as seal_interface_cable_id,
            seal_interface.direction as seal_interface_direction
        from
            ftth.seal_interface as seal_interface
        left join ftth.port as port on (seal_interface.port_id = port.id)
        left join ftth.closure as closure on (port.closure_id = closure.id)
        left join ftth.closure_type as closure_type on (closure_type.id = closure.type_id)
        left join ftth.cable as cable ON (seal_interface.cable_id = cable.id)
        left join ftth.cable_type as cable_type on (cable_type.id = cable.type_id)
        where seal_interface.cable_id = ${id}
        and (
            (closure_type.name = 'L4' and cable_type.name = 'Feed')
            or
            (closure_type.name = 'L3' and cable_type.name = 'Access')
            or
            (closure_type.name = 'L2' and cable_type.name = 'Distribution')
            or
            (closure_type.name = 'L1' and cable_type.name = 'Spine')
        )
        and seal_interface.direction = 'Out'
        ${ignoreList.length ? 'AND seal_interface.id NOT IN (' + ignoreList.join() + ')' : ''}
        `

    const part_2 = await pg.query(query_secondary);

    if(part_2.length > 1) {
      for(let item of part_2) {
        if(prevId !== item.closure_id) {
          const base = {
            closure: item.closure_id,
            direction: item.seal_interface_direction,
            cable: item.seal_interface_cable_id,
            seal_interface: item.seal_interface_id,
            is_loop: false,
          }
          data.push(base);

          ignoreList.push(item.seal_interface_id)
          await funcQuery_1(item.closure_id, pg);
        }
      }
    } else if(part_2.length > 0) {
      const base = {
        closure: part_2[0].closure_id,
        direction: part_2[0].seal_interface_direction,
        cable: part_2[0].seal_interface_cable_id,
        seal_interface: part_2[0].seal_interface_id,
        is_loop: false,
      }
      data.push(base);

      ignoreList.push(part_2[0].seal_interface_id)
      await funcQuery_1(part_2[0].closure_id, pg, id);
    } else {
      return;
    }
  }
}

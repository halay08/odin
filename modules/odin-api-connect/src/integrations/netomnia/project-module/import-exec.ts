import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import { setupExchangeProject } from './0A-setup-exchange-project-script';
import { setupProjects } from './0B-setup-new-project-script';
import { importMilestones } from './1-import-milestones-from-gis';
import { importTasks } from './2-import-milestone-tasks';
import { importFeatures } from './3-import-task-features';
import { importProducts } from './4-import-task-products';
import { IPolygon } from './interfaces/gis.interfaces';


dotenv.config({ path: '../../../../.env' });


async function sync() {

    // CLI arguments
    let findArgInit = process.argv.find(arg => arg.indexOf('init') > -1);
    let argInit = findArgInit ? findArgInit.split('=')[1] : null;

    let findArgProjectName = process.argv.find(arg => arg.indexOf('name') > -1);
    let argProjectName = findArgProjectName ? findArgProjectName.split('=')[1] : null;

    let findArgL0PolygonId = process.argv.find(arg => arg.indexOf('l0id') > -1);
    let argL0PolygonId = findArgL0PolygonId ? findArgL0PolygonId.split('=')[1] : null;

    let findArgPolygonId = process.argv.find(arg => arg.indexOf('polygonid') > -1);
    let argPolygonId = findArgPolygonId ? findArgPolygonId.split('=')[1] : null;

    let findArgProgramId = process.argv.find(arg => arg.indexOf('programid') > -1);
    let argProgramId = findArgProgramId ? findArgProgramId.split('=')[1] : null;

    let findArgExchangeMilestoneId = process.argv.find(arg => arg.indexOf('exmtid') > -1);
    let exchangeMilestoneId = findArgExchangeMilestoneId ? findArgExchangeMilestoneId.split('=')[1] : null;

    let findArgPlanMilestoneId = process.argv.find(arg => arg.indexOf('planmtid') > -1);
    let planMilestoneId = findArgPlanMilestoneId ? findArgPlanMilestoneId.split('=')[1] : null;

    let isL0Polygon = process.argv.find(arg => arg.indexOf('isl0') > -1);
    let isl0 = isL0Polygon ? isL0Polygon.split('=')[1] : null;

    // if changes are made for a single task in GIS, i.e adding new products
    // we can get a single task that needs to have the products updated.
    // otherwise leave this null;
    const taskId = null;

    // If you only have the odin milestone Id you can run the script from the milestone Id in Odin.
    const milestoneId = null;

    // When we need to create milestone tasks for a single polygonId
    // Edge case if we need to import from a single polygon
    const polygonId = argPolygonId ? Number(argPolygonId) : undefined;

    // default start from the l0 polygonId
    const l0PolygonId = argL0PolygonId ? Number(argL0PolygonId) : undefined;
    console.log({ l0PolygonId });

    // all the polygons that exist inside of an L0.
    const polygonNames = isl0 ? [ 'L0' ] : [ 'L1', 'L2' ];

    const programId = argProgramId;
    const exchangeMilestoneTemplateId = exchangeMilestoneId;
    const planMilestoneTemplateId = planMilestoneId;

    const exchangeProjects: IPolygon[] = [
        {
            title: argProjectName,
            polygonId: l0PolygonId,
        },
    ];

    const projects: IPolygon[] = [
        {
            title: argProjectName,
            polygonId: l0PolygonId,
        },
    ];

    // Run process for importing data
    try {

        // add exchange projects
        if(argInit === 'exchanges') {
            const newExchangeProjects = await setupExchangeProject(
                exchangeProjects,
                programId,
                l0PolygonId,
                exchangeMilestoneTemplateId,
            );
            console.log('newExchangeProjects', newExchangeProjects);
        }

        // Add projects and milestones
        if(argInit === 'projects') {
            const newProjects = await setupProjects(projects, programId, planMilestoneTemplateId);
            console.log('newProjects', newProjects);

            // Add milestones to each project
            for(const project of newProjects) {
                console.log('project', project);
                const milestones = await importMilestones(project.id, getProperty(project, 'PolygonId'));
                console.log('milestones', milestones);
            }
        }

        // Add tasks to each milestone
        if(argInit === 'tasks') {
            const tasks = await importTasks(l0PolygonId, polygonNames);
            console.log('tasks', tasks);
        }

        // Add features to tasks
        if(argInit === 'features') {
            console.log('l0PolygonId, polygonNames, polygonId', l0PolygonId, polygonNames, polygonId);
            const features = await importFeatures(l0PolygonId, polygonNames, polygonId);
            console.log('features', features);
        }

        if(argInit === 'products') {
            const products = await importProducts(l0PolygonId, polygonNames);
            console.log('products', products);
        }


    } catch (e) {
        console.error(e)
    }
}

sync();

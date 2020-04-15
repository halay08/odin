 the order should generally be (going over all of the scripts in project-module folder, detailed explanations marked with asterisk)
0B-setup-new-project-script.ts (Sets up the exchange project for the program and adds the Build(Exchange) milestone in it)
0A-setup-exchange-project-script.ts (Set up one or multiple build projects for the program and a Plan milestone in each one of them)
1-import-milestones-from-gis.ts (Imports milestones from milestone templates for the specified project id by setting up the variable milestoneProjectId) *
2-import-milestone-tasks.ts (Goes through the milestones specified by milestoneId or polygonId or all of the milestones with type targetPolygonMilestones intersected by basePolygonId )
update-milestone-stage.ts (Goes through all of the milestones with type targetPolygonMilestones intersected by basePolygonId  and sets the stage key based on gis build_status_id)
3-import-task-features.ts (Goes through tasks that have polygonId or are associated with milestones with type targetPolygonMilestones intersected by basePolygonId and finds the geom features in GIS and creates external ref.)**
4-import-task-products.ts (Goes through a single task by id taskId or tasks within a milestone by id milestoneId  or all the task that have PolygonId polygonId  or through all of the milestones with type targetPolygonMilestones intersected by basePolygonId  and gets the LABOR products as well as MATERIAL products from gis models tables using external refs to associate or update the products to the tasks)
update-task.stages.ts (Goes through a single task by id taskId or tasks within a milestone by id milestoneId  or all the task that have PolygonId polygonId and updates the task stages EXCEPT the non geom tasks such as TEST, SPLICE or AS-BUILT.



* Up/Down are directions of how the milestones are imported
Example:
    - up requires a l4ClosureId to be defined as a starting point and milestoneProjectId searching for the L4 polygon that contains the l4ClosureId going up to L1 finally associating the the L1 to the project essentially importing no more and no less than 4 milestones from L4-L1. When imporing all polygons the direction MUST BE down, it is required to define the L0 id in variable rootPolygonId and optionally limit the  polygon types by removing or commenting out the elements of the variable polygonNames . Right now one polygon can be imported by adding another line in the query on line 206 by adding AND poly_2.id = ${SINGLE_POLYGON_ID} but keep in mind if the polygon is outside the boundaries of milestoneProjectId it wont be able to find the parent milestone therefore will be in undefined state possibly compromising the data integrity.

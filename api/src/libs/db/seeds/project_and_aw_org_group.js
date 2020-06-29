/* eslint-disable no-param-reassign */

'use strict';

const refAwTable = 'ref_aw_deployment_group';
const refProjectTable = 'project';
const table = 'job';

exports.seed = async knex => {
  // this is fake data:
  const awData = [
    {
      aw_code: '848',
      aw_group_name: 'Citizens Service',
      aw_group_id: 'CITZ',
    },
  ];

  const projectData = [
    {
      project_name: 'testDeployment',
      aw_group_id: 'CITZ',
    },
  ];

  await knex(table).delete();
  await knex(refProjectTable).delete();
  await knex(refAwTable).delete();
  await knex(refAwTable).insert(awData);
  await knex(refProjectTable).insert(projectData);
};

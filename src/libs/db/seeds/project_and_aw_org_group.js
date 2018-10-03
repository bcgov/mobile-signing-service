/* eslint-disable no-param-reassign */

'use strict';

const ref_aw_table = 'ref_aw_deployment_group';
const ref_project_table = 'project';
const table = 'job';

exports.seed = async (knex) => {
  // this is fake data:
  const awData = [
    {
      aw_code: '848',
      aw_group_name: 'Citizens Service',
      aw_group_id: 'CITZ',
    }
  ];

  const projectData = [
    {
      project_name: 'testDeployment',
      aw_group_id: 'CITZ',
    }
  ];

  await knex(table).delete();
  await knex(ref_project_table).delete();
  await knex(ref_aw_table).delete();
  await knex(ref_aw_table).insert(awData);
  await knex(ref_project_table).insert(projectData);
};

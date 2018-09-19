
/* eslint-disable no-param-reassign */

'use strict';

const table = 'ref_aw_deployment_group';

exports.seed = async (knex) => {
  const ref = [
    {
      aw_code: '848',
      aw_group_name: 'Citizens Service',
      aw_group_id: 'CITZ',
    }
  ];

  await knex(table).delete();
  await knex(table).insert(ref);
};

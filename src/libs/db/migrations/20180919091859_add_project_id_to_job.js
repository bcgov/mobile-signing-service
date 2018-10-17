'use strict';

/* eslint-disable no-unused-vars */

const table = 'job';

exports.up = async knex =>
  knex.schema.table(table, async t => {
    t.integer('project_id').unsigned().references('id').inTable('project');
  });

exports.down = async knex =>
  knex.schema.table(table, async t => {
    t.dropColumn('project_id');
  });

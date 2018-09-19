
'use strict';

/* eslint-disable no-unused-vars */

const table = 'job';


exports.up = function(knex, Promise) {
  return knex.schema.table(table, function(t) {
    t.integer('project_id').unsigned().references('id').inTable('project');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table(table, function(t) {
    t.dropColumn('project_id');
  })
};

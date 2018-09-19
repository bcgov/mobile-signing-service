'use strict';

/* eslint-disable no-unused-vars */

const table = 'project';

exports.up = async knex =>
  knex.schema.createTable(table, async t => {
    t.increments('id').unsigned().index().primary();
    t.string('project_name', 128).notNull();
    t.string('aw_group_id', 16).references('aw_group_id').inTable('ref_aw_deployment_group');
    t.dateTime('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));
    t.dateTime('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

    const query = `
    CREATE TRIGGER update_${table}_changetimestamp BEFORE UPDATE
    ON ${table} FOR EACH ROW EXECUTE PROCEDURE 
    update_changetimestamp_column();`;

    await knex.schema.raw(query);
  });

exports.down = knex => knex.schema.dropTable(table);

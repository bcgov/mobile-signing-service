'use strict';

/* eslint-disable no-unused-vars */

const table = 'ref_aw_deployment_group';

exports.up = async knex =>
  knex.schema.createTable(table, async t => {
    t.increments('id')
      .unsigned()
      .index()
      .primary();
    t.string('aw_code', 8)
      .notNull()
      .unique();
    t.string('aw_group_name', 128)
      .unique()
      .notNull();
    t.string('aw_group_id', 16)
      .unique()
      .notNull();
    t.dateTime('created_at')
      .notNull()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));
    t.dateTime('updated_at')
      .notNull()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

    const query = `
    CREATE TRIGGER update_${table}_changetimestamp BEFORE UPDATE
    ON ${table} FOR EACH ROW EXECUTE PROCEDURE 
    update_changetimestamp_column();`;

    await knex.schema.raw(query);
  });

exports.down = knex => knex.schema.dropTable(table);

describe('one to many', () => {
  var db
  var personTable
  var taskTable
  beforeEach(async (done) => {
    var schemaBuilder = lf.schema.create('tasks', 1)
    schemaBuilder.createTable('Person')
      .addColumn('id', lf.Type.INTEGER)
      .addColumn('name', lf.Type.STRING)
      .addPrimaryKey(['id'])

    schemaBuilder.createTable('Task')
      .addColumn('id', lf.Type.INTEGER)
      .addColumn('description', lf.Type.INTEGER)
      .addColumn('personId', lf.Type.INTEGER)
      .addPrimaryKey(['id'])
      .addForeignKey('fkPersonId', {
        local: 'personId',
        ref: 'Person.id'
      })

    db = await schemaBuilder.connect()
    personTable = db.getSchema().table('Person')
    taskTable = db.getSchema().table('Task')

    done()
  })

  it('should let me insert rows', async (done) => {
    await db.insertOrReplace().into(personTable).values([
      personTable.createRow({ id: 1, name: 'Person One' }),
      personTable.createRow({ id: 2, name: 'Person Two' })
    ]).exec()

    await db.insertOrReplace().into(taskTable).values([
      taskTable.createRow({ id: 1, description: 'Task One', personId: 1 }),
      taskTable.createRow({ id: 2, description: 'Task Two', personId: 1 })
    ]).exec()

    var rows = await db.select(
      personTable.id.as('personId'),
      personTable.name.as('personName'),
      lf.fn.count(taskTable.id).as('taskCount')
    ).from(personTable, taskTable)
    .where(taskTable.personId.eq(personTable.id))
    .groupBy(personTable.id, personTable.name)
    .exec()

    expect(rows.length).toBe(1)
    expect(rows[0].personId).toBe(1)
    expect(rows[0].personName).toBe('Person One')
    expect(rows[0].taskCount).toBe(2)

    done()
  })
})

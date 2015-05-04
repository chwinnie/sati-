class CreateNotDueTasks < ActiveRecord::Migration
  def change
    create_table :not_due_tasks do |t|
      t.string :google_id
      t.string :title
      t.datetime :last_updated
      t.text :notes
      t.boolean :is_completed
      t.references :tasklist, index: true

      t.timestamps null: false
    end
    add_foreign_key :not_due_tasks, :tasklists
  end
end

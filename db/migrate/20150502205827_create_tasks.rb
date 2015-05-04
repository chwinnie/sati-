class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.string :description
      t.datetime :duedate

      t.timestamps null: false
    end
  end
end

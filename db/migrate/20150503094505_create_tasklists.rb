class CreateTasklists < ActiveRecord::Migration
  def change
    create_table :tasklists do |t|
      t.string :google_id
      t.string :title
      t.datetime :last_updated

      t.timestamps null: false
    end
  end
end

class AddReferenceToTasklist < ActiveRecord::Migration
  def change
  	add_column :tasklists, :user_id, :integer
  	add_index :tasklists, :user_id
  end
end

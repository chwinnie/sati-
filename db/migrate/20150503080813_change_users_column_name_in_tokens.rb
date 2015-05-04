class ChangeUsersColumnNameInTokens < ActiveRecord::Migration
  def change
  	rename_column :tokens, :users_id, :user_id
  end
end

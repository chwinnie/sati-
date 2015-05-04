class RemoveUserIdColumnsFromTokens < ActiveRecord::Migration
  def change
    remove_column :tokens, :User_id
  end
end

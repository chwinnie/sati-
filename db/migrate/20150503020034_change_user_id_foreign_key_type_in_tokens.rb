class ChangeUserIdForeignKeyTypeInTokens < ActiveRecord::Migration
  def change
  	change_column :tokens, :User_id, :string
  end
end

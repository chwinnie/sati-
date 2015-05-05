class RemoveUidColumnFromTokens < ActiveRecord::Migration
  def change
  	remove_column :tokens, :uid, :string
  end
end

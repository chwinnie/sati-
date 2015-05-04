class AddIndexOnUidToTokens < ActiveRecord::Migration
  def change
  	add_index :tokens, :uid
  end
end

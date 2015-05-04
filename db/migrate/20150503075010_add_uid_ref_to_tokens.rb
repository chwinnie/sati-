class AddUidRefToTokens < ActiveRecord::Migration
  def change
    add_reference :tokens, :users, index: true
    add_foreign_key :tokens, :users
  end
end

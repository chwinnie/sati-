class AddUidRefToTokens < ActiveRecord::Migration
  def change
    add_reference :tokens, :users, index: true
  end
end

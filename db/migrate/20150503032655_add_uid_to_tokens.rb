class AddUidToTokens < ActiveRecord::Migration
  def change
    add_column :tokens, :uid, :string
  end
end

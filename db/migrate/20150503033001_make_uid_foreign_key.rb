class MakeUidForeignKey < ActiveRecord::Migration
  def change
  	add_foreign_key :tokens, :users, column: :uid_foreign_key, primary_key: :uid
  end
end

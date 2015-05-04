class Tasklist < ActiveRecord::Base
	has_many :due_tasks
	has_many :not_due_tasks
	belongs_to :user
end

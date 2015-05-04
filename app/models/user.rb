class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
	devise :omniauthable, :omniauth_providers => [:google_oauth2]
  has_one :token
  has_many :tasklists
  accepts_nested_attributes_for :tasklists, :reject_if => :all_blank

# rails g model Token access_token:string refresh_token:string expires_at:datetime
  	# def create_user_token(access_token)
  	# 	credentials = access_token.credentials
  	# 	user.create_token({
  	# 		access_token: credentials["access_token"],
  	# 		refresh_token: credentials["refresh_token"],
  	# 		expires_at: credentials["expired_at"]
  	# 		})
  	# end

	def self.find_for_google_oauth2(auth, signed_in_resource=nil)
	    user_info = auth.info
	    credentials = auth.credentials
	    @user = User.where(:email => user_info["email"]).first

	    unless @user
	        @user = User.create(uid: auth.uid,
	           name: user_info["name"],
	           email: user_info["email"],
	           password: Devise.friendly_token[0,20]
	           # authentication_token: credentials["token"]
	        )
	    puts @user.id
	    # puts "hey"
	    # puts credentials["token"]
	    # puts credentials["refresh_token"]
	    # puts credentials["expires_at"]
	        @user.create_token({
  			  access_token: credentials["token"],
  			  refresh_token: credentials["refresh_token"],
  			  expires_at: Time.at(credentials["expires_at"]).to_datetime
  			})
	    end

	    @user
end
end

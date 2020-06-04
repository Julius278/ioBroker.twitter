'use strict';

class UserInformation{
    constructor(id, username, description, follower, profile_image_url, created_at){
        this.id = id;
        this.username = username;
        this.description = description;
        this.follower = follower;
        this.profile_image_url = profile_image_url;
        this.created_at = created_at;
    }
}
module.exports = UserInformation;
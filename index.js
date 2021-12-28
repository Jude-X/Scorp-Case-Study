/*------------------------- Q1 ------------------------ */
var get_posts = function(user_id, post_ids){
    // fetch posts from DB that have ids in the post_ids array - O(n)
    let postsResult = conn.query("SELECT * FROM post WHERE id IN :post_ids", {
        replacements: {
            post_ids: post_ids
        }
    })

    // Fetch post liked by the user - O(1)
    let likesResult = conn.query("SELECT * FROM like WHERE user_id = :user_id", {
        replacements: {
            user_id: user_id
        }
    })

    // Fetch followers followed by the user - O(1)
    let followsResult = conn.query("SELECT * FROM follow WHERE user_id = :user_id", {
        replacements: {
            user_id: user_id
        }
    })

    // Create sets to allow checks for followed and liked properties to be done in average - O(1)
    let followSet = new Set()
    let likeSet = new Set()

    //loop through the follow results and add the following id in the set - O(n)
    for(let followObject of followsResult){
        followSet.add(followObject.following_id)
    }

    //loop through the like results and add the post id in the set - O(n)
    for(let likeObject of likesResult){
        likeSet.add(likeObject.post_id)
    }

    // The above was done to prevent O(n^2) time in checking that the user is following the users that created the post
    // or liked a post


    //create a hashmap to allow sorting according to post_ids order and to place null for posts that dont exist
    let postsMap = new Map()

    // O(n)
    for(let postObject of postsResult){
        let user = conn.query("SELECT * FROM user WHERE id = :id", {
            replacements: {
                id: postObject.user_id
            }
        })

        // O(1) set lookup, could have been O(n) if searching an array instead, leading to O(n)
        if(followSet.has(postObject.user_id)){
            user["followed"] = true
        }else{
            user["followed"] = false
        }

        // O(1)
        postObject["owner"] = user

        // O(1) set lookup
        if(likeSet.has(postObject.id)){
            postObject["liked"] = true
        }else{
            postObject["liked"] = false
        }
    
        //Add the modified object or struct in the hashmap - O(1)
        //using the post_id for key and the postResult as value
        postsMap.set(postObject["id"], postObject)
    }

    //final result
    let result = []

    // sorting in order of post_ids -  O(n) 
    for(let id of post_ids){
        // O(1)
        if(!postsMap.has(id)){
            // O(1)
            result.push(null)
        }else{
            // O(1)
            result.push(postsMap.get(id))
        }
    }
    return result
    
}




/* ------------------- Q2 ------------------------------ */
var merge_posts = function(list_of_posts){
    //Using a hashmap

    let map = new Map()

    //O(mn) - loop through add to map if it is not present
    for(let lists of list_of_posts){
        for(let post of lists){
            if(!map.has(post.id)){
                map.set(post.id, post)
            }
        }
    }

    //O(k) where k is the number of unique post ids
    let result = map.values()

    //O(klogk) merge-sort
    result.sort((a, b) => {
        if(a.created_at === b.created_at){
            return (a.id < b.id) ? 1 : -1
        }else{
            return (a.created_at < b.created_at) ? 1 : -1
        }
    })

    return result
}
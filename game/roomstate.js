export class Roomstate {
    constructor(passcode) {
        this.connection_map = {};
        this.room_size = 5;
        this.passcode = passcode;
    }

    add_player = (player_name, id) => {
        this.connection_map[id] = {
            name: player_name,
        };

        this.connection_map[id].player_number = Object.keys(this.connection_map).length
    }

    update_player = (player_name, new_id) => {
        
    }
}
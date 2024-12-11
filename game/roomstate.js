export class Roomstate {
  constructor(passcode) {
    this.connection_map = {};
    this.room_size = 5;
    this.passcode = passcode;
  }

  add_player = (player_name, id) => {
    this.connection_map[player_name] = {
      id: id,
      name: player_name,
    };

    this.connection_map[player_name].player_number = Object.keys(
      this.connection_map
    ).length;
  };

  get_player_by_id = (id) => {
    for (let player_name in this.connection_map) {
      if (this.connection_map[player_name].id === id)
        return this.connection_map[player_name];
    }

    return null;
  };

  get_player_by_name = (name) => {
    for (let player_name in this.connection_map) {
      if (this.connection_map[player_name].name === name)
        return this.connection_map[player_name];
    }

    return null;
  };

  is_full = () => {
    return Object.keys(this.connection_map).length === 5;
  };
}

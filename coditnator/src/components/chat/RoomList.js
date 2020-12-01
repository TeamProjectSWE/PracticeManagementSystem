import React from 'react';
import Room from './Room'

const RoomList = ({rooms,enterRoom})=>{
    const roomsList = rooms.map(
        room => <Room
            key={room.roomNumber}
            roomNumber={room.roomNumber}
            numOfPlayer={room.numOfPlayer}
            roomName={room.roomName}
            enterRoom={enterRoom}
        />
    )
        return(
            <div id="room-list">
                {roomsList}
            </div>
        )
}

export default RoomList;
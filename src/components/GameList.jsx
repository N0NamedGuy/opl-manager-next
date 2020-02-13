import React from 'react';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';

const GameList = ({ gameList, onDelete }) => {
    const sortedGameList = [...gameList]
        .sort((a, b) => {
            const titleA = a.title.toUpperCase();
            const titleB = b.title.toUpperCase();
            if (titleA < titleB) {
                return -1;
            } else if (titleA > titleB) {
                return 1;
            }

            return 0;
        });

    return <ListGroup >
        {sortedGameList.map((game, i) =>
            <ListGroupItem key={i}>
                <div className="d-flex">
                    <span className="flex-grow-1">
                        <small><tt>[{game.gameId}]</tt></small> &nbsp;
                        <strong>{game.title}</strong>
                        <br />
                        <small className="text-muted">{game.fullPath}</small>
                    </span>
                    <span>
                        <Button variant="danger"
                            onClick={() => { onDelete(game) }}>Delete</Button>
                    </span>
                </div>
            </ListGroupItem>)
        }
    </ListGroup >;
}

export default GameList;
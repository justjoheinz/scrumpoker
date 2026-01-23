# Scrumpoker

## Domain

I a game of scrum poker, participants gather together in a room. They are known by their name to all other people in the same room. 

Initially no participants has chosen a card. When they have discussed reqquiremnts, taks etc. (outside of the game), they will choose a card. Cards to choose from are open (face up) and have the values 1,2,3,5,8,13,20 and X. A player will chose a card and it is displayed facae down next to his name. All other players can see that cards where choosen immediately, but since the cards are face down, they can't see their values. 

When someone deems the time has come, they can press a button "Reveal" which turns the cards face up. That stops the possibility to choose a card and/or change the value. The players are displayed in a table sorted by the value of the their card and their name. 

Once players came to a conclussion about their result, they can reset the game. All cards are back in the stack, the order of the players is again just alphabetical and they can start to choose a new card, which again is displayed face down.

During the game, each player can leave the room by pressing an "trashcan" button next to their name. the leave button can also be pressed on behalf of a player by other players.

## Technical requirements

the scrum poker shall be implemented as a 

- client/server application
- the application is stateless, so that no database is required
- the application uses websockets, so that information about players, cards, next rounds, in general all events can be distributed to players immediately without requiring a page reload.
- the application shall be implemented using typescript
- the client shall use https://materializecss.com/ as a CSS framework
- the application shall be written using next.js (typescript)



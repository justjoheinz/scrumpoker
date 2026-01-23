'use client';

import Navigation from '@/components/Navigation';
import { useAdminStats } from '@/hooks/useAdminStats';
import { CARD_VALUES, CardValue } from '@/types/game';

export default function AdminPage() {
  const { stats, isLoading, error, refresh } = useAdminStats();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <Navigation />
      <main>
        <div className="container">
          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="card-title">Server Statistics</span>
                    <button
                      className="btn waves-effect waves-light teal"
                      onClick={refresh}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Refresh'}
                      <i className="material-icons right">refresh</i>
                    </button>
                  </div>
                  {stats && (
                    <p className="grey-text">Last updated: {formatTimestamp(stats.timestamp)}</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="card red lighten-4">
                  <div className="card-content red-text text-darken-4">
                    <span className="card-title">Error</span>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {isLoading && !stats && (
                <div className="center-align" style={{ padding: '40px' }}>
                  <div className="preloader-wrapper active">
                    <div className="spinner-layer spinner-teal-only">
                      <div className="circle-clipper left">
                        <div className="circle"></div>
                      </div>
                      <div className="gap-patch">
                        <div className="circle"></div>
                      </div>
                      <div className="circle-clipper right">
                        <div className="circle"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stats && (
                <>
                  {/* Room Statistics */}
                  <div className="row">
                    <div className="col s12">
                      <h5>Rooms</h5>
                    </div>
                    <div className="col s6 m4 l2">
                      <div className="card teal lighten-4">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.rooms.total}</span>
                          <p>Total Rooms</p>
                        </div>
                      </div>
                    </div>
                    <div className="col s6 m4 l2">
                      <div className="card grey lighten-3">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.rooms.empty}</span>
                          <p>Empty</p>
                        </div>
                      </div>
                    </div>
                    <div className="col s6 m4 l2">
                      <div className="card blue lighten-4">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.rooms.withPlayers}</span>
                          <p>With Players</p>
                        </div>
                      </div>
                    </div>
                    <div className="col s6 m4 l2">
                      <div className="card green lighten-4">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.rooms.revealed}</span>
                          <p>Revealed</p>
                        </div>
                      </div>
                    </div>
                    <div className="col s6 m4 l2">
                      <div className="card orange lighten-4">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.rooms.hidden}</span>
                          <p>Hidden</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Player Statistics */}
                  <div className="row">
                    <div className="col s12">
                      <h5>Players</h5>
                    </div>
                    <div className="col s6 m3">
                      <div className="card teal lighten-4">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.players.total}</span>
                          <p>Total Players</p>
                        </div>
                      </div>
                    </div>
                    <div className="col s6 m3">
                      <div className="card blue lighten-4">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.players.averagePerRoom}</span>
                          <p>Avg per Room</p>
                        </div>
                      </div>
                    </div>
                    <div className="col s6 m3">
                      <div className="card green lighten-4">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.players.withCards}</span>
                          <p>With Cards</p>
                        </div>
                      </div>
                    </div>
                    <div className="col s6 m3">
                      <div className="card grey lighten-3">
                        <div className="card-content center-align">
                          <span className="card-title">{stats.players.withoutCards}</span>
                          <p>Without Cards</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Distribution */}
                  <div className="row">
                    <div className="col s12">
                      <h5>Card Distribution</h5>
                    </div>
                    {CARD_VALUES.map((card: CardValue) => (
                      <div key={card} className="col s6 m3 l1-5" style={{ width: '12.5%' }}>
                        <div className="card purple lighten-4">
                          <div className="card-content center-align" style={{ padding: '12px' }}>
                            <span className="card-title" style={{ fontSize: '1.5rem' }}>{stats.cards.distribution[card]}</span>
                            <p style={{ fontWeight: 'bold' }}>{card}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

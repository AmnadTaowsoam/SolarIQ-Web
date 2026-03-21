'use client'

import { useState, useEffect, useCallback } from 'react'
import { openDB } from '@/lib/offlineDb'

import { Lead } from '@/types'

interface Lead {
    id: string
    name: string
    phone: string
    email: string
    status: 'new' | 'contacted' | 'qualified'
    | 'proposal_viewed' | 'converted'
    status: 'lost'
    createdAt: Date
    lastContact?: string
    notes?: string
}

 }

return {
    []
  return db
await openDB<SolarIQDB>()
      return db
}

 }
    }
  }
?.catch (error) {
    console.error('Failed to open database', error)
}
return null
  }

    }
  }

?.catch (error) {
    console.error('Failed to open database', error)
}
  })
}

// Clear synced actions
if (success) {
    console.log('✓ Actions synced successfully')
} else {
    // Show success toast
}
        }
      }
    }
  })
}

 .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
}

// Clear synced actions
if (success) {
    console.log('✓ Actions synced successfully')
} else {
    // Show error toast
}
        }
      }
    }
  }
 catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
}

 .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
}

 .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  })
            .catch (error) {
    console.error('Failed to sync pending actions', error)
}
  )
            .catch (error) {
    console.error('Failed to sync plan actions', error)
        < div className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800" >
            <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                < div className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                    < div className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                        < isMobile ? 'bottom-20' : 'bg-slate-700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' | null) {
        // Check if should show install banner
        setShowOfflineBanner(false)
    }
    return
}
      }
    }

// Register background sync
const registration = await navigator.serviceWorker.ready
if (!registration) {
    console.warn('Service worker not supported')
    return null
}

if (isOffline) {
    console.warn('Service worker not supported. Please register sync manually')
    return
}
  }, [isOffline, 'bg-slate-700' text - slate - 500')
    }
  }, [isOffline, 'bg-slate-700', 'text-slate-500')
  }
          />
        }
      }
    })
  }

  // Register background sync
    const registration = await navigator.serviceWorker.ready
if (!registration) {
    console.warn('services worker not supported')
    return null
}
  }, [isOffline, 'bg-slate-700']. 'text-slate-500')
    }
  }
    }
  }
// Register sync
const registration = await navigator.serviceWorker.ready
if (!registration.sync) {
    console.warn('services worker not supported')
    return null
}
  }, [isOffline, 'bg-slate-700']. 'text-slate-500')
    }
  ]
  : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' | null) {
}
        }
      }
    }
  }
// Check if should show banner
setShowOfflineBanner(false)
          }
        }
      }
    }
  }
// Pull to refresh
setIsPullToRefresh(true)
            }
// Clear offline banner
clearTimeout(clearOfflineBanner()
            return
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          )
        }
      }
    })
  }

// Clear synced actions
const pendingAction = usePendingActions()
if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show success toast
}
          }
        }
      }
    }
  }
// Clear synced actions
if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
}
          }
        }
      }
    }
  }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
    >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
        >
        <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            >
            <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                >
                <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                    >
                    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                        >
                        <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                            >
                            <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                                >
                                <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                                    >
                                    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800)
                                        >
                                        <div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
                                            >
                                            <div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800'
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
    >
    <div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800')
                          }
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800)
                          }
[isOffline, 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' | null) {
    setShowOfflineBanner(false)
}
          // Clear offline banner on reconnect
            setOfflineBannerVisible(true)
          }
        }
      }
    }

    // Clear synced actions
          if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
}
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
</div>
    </div>
    </div>
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
</div>
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
</div>
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
</div
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
</div>
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        : 'bg-slate-700' ? 'text-slate-400' : 'bg-slate-700' ? 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate-700' : 'bg-slate/700' : 'bg-slate/700' ? 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' + ' bg-slate-700'
                      : 'bg-slate-700'
                      : 'bg-slate-700'
                    } else if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
}
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        }
      }
    } else {
    // Show success toast
}
          }
        }
      }
    }
  ], [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        )
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        : 'bg-slate-700' ? 'text-slate-400' : 'bg-slate/700' : 'bg-slate/700' : 'bg-slate/700' + 'bg-slate/700'
          : 'bg-slate-700' ? 'text-slate-400' : 'bg-slate/700' ? 'bg-slate/700' + 'bg-slate/700'
    : 'bg-slate-700' : 'text-slate-400' />
          }
        }
      }
    }
  }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
    >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
        >
        <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            >
            <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                >
                </div>
                </div>
                </div>
                </ Hide on scroll, hide bottom nav
setIsScrollDown(true)
            }
          }
// Pull to refresh
if (isPullToRefresh) {
    // Trigger refresh
    onRefresh()
}
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
        >
        <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
                            }
</div>
    </div>
    </div>
    </div>
    </div>
    </div
    </div
    </div>
    </div>
    </div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
    >
    <div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
        >
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p-13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p-13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p-13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p-13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p-13 shadow-lg rounded-xl border border-slate-800"
          }
          .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
            .div
    </div>
    </div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
      .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
      .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
      .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
      .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
          .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
            .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
          .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
            .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
              .div
className = "flex items-center gap-13 p_13 shadow-lg rounded-xl border border-slate-800"
          }
            .div
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-13 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </iv>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </iv
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </iv
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </iv
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </iv
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
    </iv
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border border-slate-800"
          }
        .div
isPendingActionsCount(prevState)
            }
// Show success toast
if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
}
          }
State.error)
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
          }
        .div
    </iv
    </div={pendingActionsCount}
 : number
          }
// Show success toast
if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
}
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p_3 shadow-lg rounded-xl border border-slate-800"
            }
</div
    </div>
    </iv
    </div
    </div>
  )
<div className="flex items-center gap-3 p_13 shadow-lg rounded-xl border borderSlate-800"
            }
</div
    </div>
    </iv
    </div
    </div>
  )
<div className="flex items-center gap-3 p-13 shadow-lg rounded-xl border borderSlate-800"
            }
</div>
    </div>
    </iv
      ) => void (isPendingActionsCount) => {
    // Show success toast
}
if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
}
currentState.error = 'Failed to sync pending actions'
              }
            }
          }

<div className="flex items-center gap-3 p-13 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv
      ) => void {
    // Show success toast
}
if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
}
currentState.error = 'failed to sync pending actions'
              }
            }
          }

 }
// Reset to initial state
setIsPendingActionsCount(prevState)
            }
// Show sync success toast
if (success) {
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
}
currentState.error = 'failed to sync pending actions'
              }
            }
// Show success toast
if (success) {
    // Show sync success toast
}
            }
          // Clear synced actions after successful sync
            }
          )
setShowOfflineBanner(false)
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // Clear synced actions
}
if (success) {
    // Show success toast
    // show sync success toast
}
            }
          // Clear synced actions after successful sync
            }
          )
setShowOfflineBanner(false)
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    // show sync success toast
}
            }
          // Clear synced actions
            }
if (success) {
    // show sync success toast
    // show success toast
    console.log('✓ actions synced successfully')
}
            }
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
} else {
    // Show error toast
    console.error('Failed to sync pending actions', error)
}
            }
// Show success toast
if (success) {
    console.log('✓ actions synced successfully')
}
            }
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
            }
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
        }
      }
    }
  }, [isOffline, 'bg-slate-700']. 'text-slate-400')
          }
        >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
            }
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
            }

          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </div>
    </div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </div>
    </div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
          // clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
        }
</div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </ iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</div>
    </ iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
    </ iv
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icon = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
          >
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
        >
        <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </div>
    </div>
  )
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
    />
    <div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
<div className="flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv>
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p_3 shadow-lg rounded-xl border borderSlate-800"
          }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border borderSlate-800"
            }
</div>
    </div>
    </iv>
      ) => void {
    // clear synced actions
}
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
          // Clear synced actions
            }
if (success) {
    // show success toast
    console.log('✓ actions synced successfully')
}
</iv
item.icons = { item.icon }
className = "flex items-center gap-3 p-3 shadow-lg rounded-xl border border-slate-800"
          }
</div>
    </div>
    </iv
document.addEventListener('DOMContentLoaded', () => {
  // --- Section A: the “/events” page block ---
  const listContainer = document.getElementById('tt-events')
  if (listContainer) {
    fetchAndRender(listContainer, false)
  }

  // --- Section B: the homepage slider ---
  const sliderContainer = document.getElementById('tt-events-slider')
  if (sliderContainer) {
    fetchAndRender(sliderContainer, true)
  }
})

/**
 * Fetch + render TT events into a container.
 *
 * @param {HTMLElement} container – where to inject HTML
 * @param {boolean} asSlider – if true, use the slider-layout
 */
function fetchAndRender(container, asSlider) {
  fetch(TT_EVENTS_CONFIG.endpoint)
    .then((res) => res.json())
    .then((events) => {
      // shared filtering
      const now = new Date()
      const futureEvents = (events || [])
        .filter((evt) => !(evt.private === true || evt.private === 'true'))
        .filter((evt) => evt.start?.iso && new Date(evt.start.iso) >= now)

      if (futureEvents.length === 0) {
        container.innerHTML = '<p>No upcoming events.</p>'
        return
      }

      function truncateWords(htmlString, maxWords = 30) {
        // 1) Turn HTML into plain text
        const div = document.createElement('div')
        div.innerHTML = htmlString
        const text = div.textContent.trim()

        // 2) Split into words
        const words = text.split(/\s+/)
        if (words.length <= maxWords) return text

        // 3) Return first maxWords + “…”
        return words.slice(0, maxWords).join(' ') + '…'
      }

      // build HTML
      const html = futureEvents
        .map((evt) => {
          // date parts
          const dt = new Date(evt.start.iso)
          const day = dt.toLocaleString('en-GB', { day: '2-digit' })
          const month = dt.toLocaleString('en-GB', { month: 'short' }).toUpperCase()

          // other bits
          const name = evt.name
          const description = evt.description || ''
          const rawDesc = evt.description || ''
          const truncDescription = truncateWords(rawDesc, 30)
          const location = evt.venue?.name || ''
          const allFree =
            Array.isArray(evt.ticket_types) && evt.ticket_types.every((t) => t.price === 0)
          const priceLabel = allFree ? 'Free' : 'Paid'
          const availRaw = String(evt.tickets_available).trim().toLowerCase()
          const available = availRaw === 'true'
          const buttonHtml = available
            ? `<a href="${asSlider ? '/events' : evt.checkout_url}"
                  class="brxe-button ${asSlider ? 'brxe-button event-slide-button bricks-button sm bricks-background-secondary' : 'bricks-button bricks-background-primary'}"
                  target="_blank" rel="noopener">
                 ${asSlider ? 'View Event' : evt.call_to_action || 'View Tickets'}
               </a>`
            : `<span class="brxe-button ${asSlider ? 'brxe-button event-slide-button bricks-button sm bricks-background-secondary' : 'bricks-button bricks-background-primary'} sold-out">
                 Sold Out
               </span>`

          // layout: slider vs list
          if (asSlider) {
            return `
    <div class="brxe-block event-slide">
      <div class="brxe-div event-slide-left">
        <div class="brxe-div event-slide-date-div">
          <div class="brxe-text event-slide-date-day">${day}</div>
          <div class="brxe-text event-slide-date-month">${month}</div>
        </div>
        ${buttonHtml}
      </div>
      <div class="brxe-div event-slide-right">
        <h4 class="brxe-heading event-slide-title">${name}</h4>
        <div class="brxe-text event-slide-content">${truncDescription}</div>
        <div class="brxe-text text-small event-slide-details">${location} | ${priceLabel}</div>
      </div>
    </div>`
          } else {
            // your existing list‐style card
            const dateStr = dt.toLocaleString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            return `
    <div class="brxe-div event-card">
      <div class="brxe-div event-details-btn-wrapper">
        <div class="brxe-div event-details-div">
          <h3 class="brxe-heading event-title">${name}</h3>
          <div class="brxe-divider event-divider horizontal"><div class="line"></div></div>
          <div class="brxe-text-basic event-details">${dateStr}</div>
          <div class="brxe-text-basic event-details">${location}</div>
          <div class="brxe-text-basic event-details">${priceLabel}</div>
          <div class="brxe-divider event-divider horizontal"><div class="line"></div></div>
        </div>
        ${buttonHtml}
      </div>
      <div class="brxe-div event-description-div">
        <div class="brxe-text event-description">${description}</div>
      </div>
    </div>`
          }
        })
        .join('')

      container.innerHTML = html

      // If it’s the slider, optionally kick off your carousel library here…
    })
    .catch((err) => {
      console.error('Ticket Tailor fetch error:', err)
      container.innerHTML = '<p>Could not load events.</p>'
    })
}

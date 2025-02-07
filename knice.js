/*****************************************************/
/*** "Go to Top" and "Go to Bottom" Scroll buttons ***/
/*****************************************************/
$(document).on('knack-scene-render.any', function(event, scene) {  
  const excludedScenes = ['scene_1', 'scene_2'] // Add scenes where you don't want the buttons to appear
  if (excludedScenes.includes(scene.key)) return
  const isModal = Knack.modals.length != 0
  const markup = 
  `
    <div id="scroll-buttons">
      <button id="go-to-top" class="kn-button">
        <i class="fa fa-arrow-up"></i>
      </button>
      <button id="go-to-bottom" class="kn-button">
        <i class="fa fa-arrow-down"></i>
      </button>
    </div>
  `
  const target = isModal ? '.kn-modal-bg' : `#kn-${Knack.router.current_scene_key}`
  const buttons = isModal ? '.kn-modal-bg #scroll-buttons' : `#kn-${Knack.router.current_scene_key} #scroll-buttons`
  const topButton = isModal ? '.kn-modal-bg #go-to-top' : `#kn-${Knack.router.current_scene_key} #go-to-top`
  const bottomButton = isModal ? '.kn-modal-bg #go-to-bottom' : `#kn-${Knack.router.current_scene_key} #go-to-bottom`
  const hasButtons = $(buttons).length

  if (hasButtons) return
  
  $(target).append(markup)
  const topElement = isModal ? '.kn-modal-bg' : 'html, body'
  
  $(topButton).on('click', function(e) {
    $(topElement).animate({ scrollTop: 0 }, "fast")
  })

  $(bottomButton).on('click', function(e) {
    $(topElement).animate({ scrollTop: $(document).height() }, "fast")
  })

  $(buttons).css('visibility', 'visible')
  const scrollableElement = isModal ? '.kn-modal-bg' : window
  
  $(scrollableElement).on('scroll',function() {
    const scroll = $(scrollableElement).scrollTop()

    if (scroll >= 50) {
      $(buttons).css('visibility', 'visible')
    } else {
      $(buttons).css('visibility', 'hidden')
    }
  })
})

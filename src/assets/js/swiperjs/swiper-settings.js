
const swprBreakpoint = window.matchMedia('(min-width:768px)');

let myProjectSwiper;

const breakpointChecker = function() {

  // if larger viewport and multi-row layout needed
  if (swprBreakpoint.matches === true) {

    // clean up old instances and inline styles when available
    if (myProjectSwiper !== undefined) myProjectSwiper.destroy(true, true);

    // or/and do nothing
    return;

    // else if a small viewport and single column layout needed
  } else if (swprBreakpoint.matches === false) {

    // fire small viewport version of swiper
    return enableSwiper();
  }
};

/**
const enableSwiper = function() {
  myProjectSwiper = new Swiper(
    ".swiper-container",
    {
      speed: 400,
      grabCursor: true,
      roundLengths: true,
      direction: "horizontal",
      updateOnWindowResize: true,
      centeredSlides: false,
      loop: true,
      breakpoints: {
        320: {

          slidesPerView: 1.25,

          spaceBetween: 20
        },
        480: {

          slidesPerView: 1.55,

          spaceBetween: 30
        },
        768: {

          slidesPerView: 2.55,

          spaceBetween: 40
        }
      }
    }
  );

};
 */
swprBreakpoint.addListener(breakpointChecker);

breakpointChecker();

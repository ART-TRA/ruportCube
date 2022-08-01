export const isMobile = () => window.innerWidth < 768;

export const isTablet = () =>
	window.innerWidth >= 768 && window.innerWidth < 1200;

export const isDesktop = () => window.innerWidth >= 1200;

export const getDeviceType = () => {
	if (isDesktop()) {
		return 'desktop';
	}
	if (isTablet()) {
		return 'tablet';
	}
	return 'phone';
};
'use strict'

const parseWhen = require('./when')
const parsePlatform = require('./platform')
const findRemarks = require('./find-remarks')

const createParseStopover = (profile, opt, data, date) => {
	const parseStopover = (st) => {
		const arr = parseWhen(profile, date, st.aTimeS, st.aTimeR, st.aTZOffset, st.aCncl)
		const arrPl = parsePlatform(profile, st.aPlatfS, st.aPlatfR, st.aCncl)
		const dep = parseWhen(profile, date, st.dTimeS, st.dTimeR, st.dTZOffset, st.dCncl)
		const depPl = parsePlatform(profile, st.dPlatfS, st.dPlatfR, st.dCncl)

		const res = {
			stop: st.location || null,
			arrival: arr.when,
			plannedArrival: arr.plannedWhen,
			arrivalDelay: arr.delay,
			arrivalPlatform: arrPl.platform,
			plannedArrivalPlatform: arrPl.plannedPlatform,
			departure: dep.when,
			plannedDeparture: dep.plannedWhen,
			departureDelay: dep.delay,
			departurePlatform: depPl.platform,
			plannedDeparturePlatform: depPl.plannedPlatform
		}

		if (arr.prognosedWhen) res.prognosedArrival = arr.prognosedWhen
		if (arrPl.prognosedPlatform) res.prognosedArrivalPlatform = arrPl.prognosedPlatform
		if (dep.prognosedWhen) res.prognosedDeparture = dep.prognosedWhen
		if (depPl.prognosedPlatform) res.prognosedDeparturePlatform = depPl.prognosedPlatform

		// mark stations the train passes without stopping
		if(st.dInS === false && st.aOutS === false) res.passBy = true

		if (st.aCncl || st.dCncl) {
			res.cancelled = true
			Object.defineProperty(res, 'canceled', {value: true})
		}

		if (opt.remarks && Array.isArray(st.msgL)) {
			res.remarks = findRemarks(st.msgL).map(([remark]) => remark)
		}

		return res
	}

	return parseStopover
}

module.exports = createParseStopover

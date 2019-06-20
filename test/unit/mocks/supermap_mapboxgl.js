import { fakeDataServiceResult, fakeMapServiceResult, fakeAddressMatch } from "./services"
const supermap = {}

supermap.FeatureService = () => {
    return {
        getFeaturesBySQL: (param, callback) => setTimeout(() => { callback(fakeDataServiceResult) }, 0),
        getFeaturesByBounds: (param, callback) => setTimeout(() => { callback(fakeDataServiceResult) }, 0)
    }
}

supermap.QueryService = () => {
    return {
        queryBySQL: (param, callback) => setTimeout(() => { callback(fakeMapServiceResult) }, 0),
        queryByBounds: (param, callback) => setTimeout(() => { callback(fakeMapServiceResult) }, 0)
    }
};

supermap.AddressMatchService = () => {
    return {
        code: (param, callback) => setTimeout(() => { callback(fakeAddressMatch) }, 0)
        // queryByBounds: (param, callback) => callback(fakeMapServiceResult)
    }
};


module.exports = supermap
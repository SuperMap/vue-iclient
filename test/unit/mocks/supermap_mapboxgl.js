import { fakeDataServiceResult, fakeMapServiceResult, fakeAddressMatch } from "./services"
const supermap = {}

supermap.FeatureService = () => {
    return {
        getFeaturesBySQL: (param, callback) => callback(fakeDataServiceResult),
        getFeaturesByBounds: (param, callback) => callback(fakeDataServiceResult)
    }
}

supermap.QueryService = () => {
    return {
        queryBySQL: (param, callback) => callback(fakeMapServiceResult),
        queryByBounds: (param, callback) => callback(fakeMapServiceResult)
    }
};

supermap.AddressMatchService = () => {
    return {
        code: (param, callback) => callback(fakeAddressMatch)
        // queryByBounds: (param, callback) => callback(fakeMapServiceResult)
    }
};


module.exports = supermap
import { MutationTree } from 'vuex'
import UtilState from './UtilState'
import * as types from './mutation-types'

const mutations: MutationTree <UtilState> = {
  [types.UTIL_CONFIG_FACILITES_UPDATED] (state, payload) {
    state.configFacilities = payload
  },
  [types.UTIL_APPLIED_FILTERS_UPDATED] (state, payload) {
    state.appliedFilters = payload
  },
  [types.UTIL_CLEARED] (state) {
    state.configFacilities = [],
    state.appliedFilters = {
      included: {
        tags: [],
        productFeatures: []
      },
      excluded: {
        tags: [],
        productFeatures: []
      }
    }
  },
  [types.UTIL_APPLIED_FILTERS_CLEARED](state) {
    state.appliedFilters = {
      included: {
        tags: [],
        productFeatures: []
      },
      excluded: {
        tags: [],
        productFeatures: []
      }
    }
  },
}
export default mutations;
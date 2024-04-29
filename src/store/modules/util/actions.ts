import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import { UtilService } from '@/services/UtilService'
import { hasError } from '@/utils'
import logger from '@/logger'
import UtilState from './UtilState'
import * as types from './mutation-types'
import store from "@/store"


const actions: ActionTree<UtilState, RootState> = {
  async fetchConfigFacilities ({ commit, state }) {
    let configFacilities = JSON.parse(JSON.stringify(state.configFacilities))

    if(configFacilities.length && configFacilities[0].productStoreId === store.state.user.currentEComStore.productStoreId) return;

    try {
      const resp = await UtilService.fetchConfigFacilities({ facilityTypeId: 'CONFIGURATION', productStoreId: store.state.user.currentEComStore.productStoreId });

      if(!hasError(resp)) {
        configFacilities = resp.data;
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
    commit(types.UTIL_CONFIG_FACILITES_UPDATED, configFacilities)
  },

  async fetchFacilityGroups ({ commit, state }) {
    let facilityGroups = JSON.parse(JSON.stringify(state.facilityGroups))

    if(facilityGroups.length && facilityGroups[0].productStoreId === store.state.user.currentEComStore.productStoreId) return;
    try {
      const resp = await UtilService.fetchFacilityGroups({ productStoreId: store.state.user.currentEComStore.productStoreId });

      if(!hasError(resp)) {
        facilityGroups = resp.data;
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
    commit(types.UTIL_FACILITY_GROUPS_UPDATED, facilityGroups)
  },

  async updateAppliedFilters ({ commit, state }, payload) {
    commit(types.UTIL_APPLIED_FILTERS_UPDATED, payload)
  },

  async clearUtilState({ commit }) {
    commit(types.UTIL_CLEARED)
  },

  async clearAppliedFilters({ commit }) {
    commit(types.UTIL_APPLIED_FILTERS_CLEARED)
  },

  async fetchFacilities({ commit, dispatch, state }, payload) {
    const params = {
      parentFacilityTypeId: 'VIRTUAL_FACILITY',
      parentFacilityTypeId_not: 'Y',
      facilityTypeId: 'VIRTUAL_FACILITY',
      facilityTypeId_not: 'Y',
      productStoreId: store.state.user.currentEComStore.productStoreId,
      pageSize: 20,
      ...payload
    }

    const facilities = state.facilities.list ? JSON.parse(JSON.stringify(state.facilities.list)) : [];
    let isScrollable = true, facilityList = [];

    try {
      const resp = await UtilService.fetchFacilities(params)

      if(!hasError(resp)) {
        if(payload.pageIndex && payload.pageIndex > 0) {
          facilityList = facilities.concat(resp.data)
        } else {
          facilityList = resp.data
        }

        const facilityIds = resp.data.map((facility: any) => facility.facilityId)
        const facilityCounts = await dispatch("fetchFacilitiesOrderCount", facilityIds)

        facilityList.map((facility: any) => {
          if(facilityCounts[facility.facilityId]) facility.orderCount = facilityCounts[facility.facilityId].orderCount;
        })

        if(resp.data.length == payload.pageSize) isScrollable = true
        else isScrollable = false
      } else {
        throw resp.data
      }
    } catch(error) {
      logger.error(error)
    }
    
    commit(types.UTIL_FACILITY_LIST_UPDATED , { facilities: facilityList.length ? facilityList : facilities, isScrollable });
  },

  async fetchFacilitiesOrderCount({ commit, state }, payload) {
    let facilitiesData = {} as any;

    try {
      const resp = await UtilService.fetchFacilitiesOrderCount({facilityIds: payload.facilityIds})

      if(!hasError(resp)) {
        facilitiesData = resp.data
      } else {
        throw resp.data
      }
    } catch(error) {
      logger.error(error)
    }
    return facilitiesData;
  },

  async updateFacilities({ commit, state }, payload) {
    commit(types.UTIL_FACILITY_LIST_UPDATED , { facilities: payload.facilities, isScrollable: state.facilities.isScrollable });
  }
}

export default actions;
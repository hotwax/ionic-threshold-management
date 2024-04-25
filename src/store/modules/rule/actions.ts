import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import RuleState from './RuleState'
import { RuleService } from '@/services/RuleService'
import { hasError } from '@/utils'
import logger from '@/logger'
import store from '@/store'


const actions: ActionTree<RuleState, RootState> = {
  async fetchRuleGroup({ commit }, payload) {
    const productStore = await store.getters['user/getCurrentEComStore']
    let ruleGroup = {} as any;
    let resp;

    try {
      resp = await RuleService.fetchRuleGroup({ ...payload, productStoreId: productStore.productStoreId })

      if(!hasError(resp) && resp.data.length) {
        ruleGroup = resp.data[0]

        resp = await RuleService.fetchRuleScheduleInformation(ruleGroup.ruleGroupId)
        if(!hasError(resp) && resp.data?.schedule) {
          ruleGroup.schedule = resp.data.schedule
        }
      } else {
        throw resp.data;
      }
    } catch(err: any) {
      logger.error("No rule group found");
    }

    commit(types.RULE_GROUP_UPDATED, ruleGroup);
    return ruleGroup
  },

  async fetchRules({ commit, dispatch }, payload) {
    const rules = [] as any;

    try {
      const ruleGroup = await dispatch('fetchRuleGroup', payload)

      if(!ruleGroup.ruleGroupId) {
        throw new Error("No rule founds")
        return;
      }

      const resp = await RuleService.fetchRules({ 
        "ruleGroupId": ruleGroup.ruleGroupId,
        "statusId": "ATP_RULE_ACTIVE",
        "orderByField": "sequenceNum"
      })

      if(!hasError(resp)) {
        const responses = await Promise.allSettled(
          resp.data.map((rule: any) => RuleService.fetchRulesActionsAndConditions(rule.ruleId))
        )

        const hasFailedResponse = responses.some((response: any) => hasError(response.value))
        if (hasFailedResponse) {
          logger.error('Failed to fetch some rules')
        }

        responses.map((response: any) => {
          if(response.status === 'fulfilled') {
            rules.push(response.value)
          }
        })
      } else {
        throw resp.data
      }
    } catch(err: any) {
      logger.error(err);
    }
    commit(types.RULE_RULES_UPDATED, { list: rules, total: rules.length});
  },
  
  updateRuleData({ commit, state }, payload) {
    const rules = JSON.parse(JSON.stringify(state.rules.list))

    const index = rules.findIndex((rule: any) => rule.ruleId === payload.rule.ruleId);
    // If index is found, replace the object
    if (index !== -1) {
      rules.splice(index, 1, payload.rule);
    }
    commit(types.RULE_RULES_UPDATED, { list: rules, total: state.rules.total});
  },

  updateRuleGroup({ commit }, payload) {
    commit(types.RULE_GROUP_UPDATED, payload);
  },

  archiveRule({ commit, state }, { rule }) {
    const rules = JSON.parse(JSON.stringify(state.rules.list))

    const index = rules.findIndex((currRule: any) => currRule.ruleId === rule.ruleId);
    if (index !== -1) {
      rules.splice(index, 1);
    }
    commit(types.RULE_RULES_UPDATED, { list: rules, total: state.rules.total});
  },

  async clearRuleState({ commit }) {
    commit(types.RULE_CLEARED)
  },
}

export default actions;
import api from '@/api';
import logger from '@/logger';
import { hasError } from '@/utils';
import { DateTime } from "luxon";

const fetchRuleGroup = async (payload: any): Promise <any>  => {
  return api({
    url: "ruleGroups",
    method: "GET",
    params: payload
  });
}

const fetchRules = async (payload: any): Promise <any>  => {
  return api({
    url: `decisionRules`,
    method: "GET",
    params: payload
  });
}

const createRuleGroup = async (payload: any): Promise <any>  => {
  let ruleGroup = {}
  try {
    const resp = await api({
      url: "ruleGroups",
      method: "POST",
      data: payload
    }) as any;

    if(!hasError(resp)) {
      ruleGroup = resp.data;
    } else {
      throw resp.data
    }
  } catch(err: any) {
    logger.error(err)
    return Promise.reject("Failed to create rule group");
  }
  return Promise.resolve(ruleGroup);
}

const updateRuleGroup = async (ruleGroupId: string, payload: any): Promise <any>  => {
  try {
    const resp = await api({
      url: `ruleGroups/${ruleGroupId}`,
      method: "POST",
      data: payload
    }) as any;

    if(!hasError(resp)) {
      return Promise.resolve(resp);
    } else {
      throw resp.data
    }
  } catch(err: any) {
    logger.error(err)
    return Promise.reject("Failed to update rule group");
  }
}

const createRule = async (payload: any): Promise <any>  => {
  let rule = {}
  try {
    const resp = await api({
      url: "decisionRules",
      method: "POST",
      data: payload
    }) as any;
    
    if(!hasError(resp)) {
      rule = resp.data;
    } else {
      throw resp.data
    }
  } catch(err: any) {
    logger.error(err)
    return Promise.reject("Failed to create rule");
  }
  return Promise.resolve(rule);
}

const updateRule = async (payload: any, ruleId: string): Promise <any>  => {
  try {
    const resp = await api({
      url: `decisionRules/${ruleId}`,
      method: "POST",
      data: payload
    }) as any;
    
    if(!hasError(resp)) {
      updateRuleGroup(payload.ruleGroupId, {lastModifiedDate: DateTime.now().toMillis()})
      return Promise.resolve(resp)
    } else {
      throw resp.data
    }
  } catch(err: any) {
    return Promise.reject(err ? err : "Failed to update rule");
  }
}

const fetchRuleScheduleInformation = async (ruleGroupId: string): Promise<any> => {
  return api({
    url: `ruleGroups/${ruleGroupId}/schedule`,
    method: "GET"
  });
}

const scheduleRuleGroup = async (payload: any): Promise<any> => {
  return api({
    url: `ruleGroups/${payload.ruleGroupId}/schedule`,
    method: "POST",
    data: payload
  });
}

const fetchRuleGroupHistory = async (payload: any): Promise<any> => {
  return api({
    url: `serviceJobRuns/${payload.jobName}`,
    method: "GET",
    params: payload
  });
}

const runNow = async (ruleGroupId: any): Promise<any> => {
  return api({
    url: `ruleGroups/${ruleGroupId}/runNow`,
    method: "POST"
  });
}

const deleteCondition = async (payload: any): Promise<any> => {
  return api({
    url: `decisionRules/${payload.ruleId}/conditions`,
    method: "delete",
    data: payload
  });
}

export const RuleService = {
  createRule,
  createRuleGroup,
  deleteCondition,
  fetchRuleGroup,
  fetchRuleGroupHistory,
  fetchRules,
  fetchRuleScheduleInformation,
  runNow,
  scheduleRuleGroup,
  updateRule,
  updateRuleGroup
}
package it.eng.spagobi.tools.alert.listener;

import it.eng.spagobi.commons.metadata.SbiCommonInfo;
import it.eng.spagobi.commons.utilities.HibernateSessionManager;
import it.eng.spagobi.kpi.bo.Kpi;
import it.eng.spagobi.kpi.bo.ThresholdValue;
import it.eng.spagobi.kpi.metadata.SbiKpiThresholdValue;
import it.eng.spagobi.kpi.metadata.SbiKpiValue;
import it.eng.spagobi.services.serialization.JsonConverter;
import it.eng.spagobi.tenant.Tenant;
import it.eng.spagobi.tenant.TenantManager;
import it.eng.spagobi.tools.alert.action.IAlertAction;
import it.eng.spagobi.tools.alert.metadata.SbiAlertAction;
import it.eng.spagobi.tools.alert.metadata.SbiAlertLog;
import it.eng.spagobi.utilities.exceptions.SpagoBIException;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

public class KpiListener extends AbstractAlertListener {

	private static Logger logger = Logger.getLogger(KpiListener.class);

	private final Set<ThresholdValue> thresholds = new HashSet<>();
	private final Map<Integer, List<SbiKpiValue>> valueMap = new HashMap<>();
	private final Map<Integer, SbiAlertAction> actionMap = new HashMap<>();

	@Override
	public void execute(String jsonParameters) {
		logger.info("KpiListener running...");
		InputParameter par = (InputParameter) JsonConverter.jsonToObject(jsonParameters, InputParameter.class);

		Session session = HibernateSessionManager.getCurrentSession();
		loadThresholdMap(par, session);

		List<SbiKpiValue> resultSet = loadResults(par.getKpi().getId());
		if (resultSet != null) {
			for (SbiKpiValue sbiKpiValue : resultSet) {
				Integer thresholdId = selectThreshold(sbiKpiValue);
				if (thresholdId != null) {
					// In this case the value of this sbiKpiValue is in a threshold
					// so we have to execute related actions
					addValueToThresholdMap(thresholdId, sbiKpiValue);
				}
			}
			for (Action action : par.getActions()) {
				try {
					executeAction(action, session);
					writeActionLog(par, action, session, null);
				} catch (SpagoBIException e) {
					logger.error("Error executing action: \"" + action.getIdAction() + "\"");
					writeActionLog(par, action, session, "Error executing action: \"" + action.getIdAction() + "\"");
				}
			}
		} else {
			writeActionLog(par, null, session, "No results on SbiKpiValue");
		}
		Transaction tx = session.beginTransaction();
		tx.commit();
		session.close();
		logger.info("KpiListener ended");
	}

	private void writeActionLog(InputParameter par, Action action, Session session, String errorMsg) {
		SbiAlertLog alertLog = new SbiAlertLog();
		if (action != null) {
			alertLog.setActionId(action.getIdAction());
			alertLog.setActionParams(action.getJsonActionParameters());
		}
		alertLog.setListenerId(getListenerId());
		alertLog.setDetail(errorMsg);
		alertLog.setListenerParams(JsonConverter.objectToJson(par, par.getClass()));
		alertLog.getCommonInfo().setTimeIn(new Date());
		alertLog.getCommonInfo().setSbiVersionIn(SbiCommonInfo.SBI_VERSION);
		Tenant tenant = TenantManager.getTenant();
		if (tenant != null) {
			alertLog.getCommonInfo().setOrganization(tenant.getName());
		}
		session.save(alertLog);
	}

	private void loadThresholdMap(InputParameter par, Session session) {
		for (Action action : par.getActions()) {
			for (Integer thresholdId : action.getThresholdValues()) {
				if (!thresholds.contains(new ThresholdValue(thresholdId))) {
					SbiKpiThresholdValue sbiThreshold = (SbiKpiThresholdValue) session.load(SbiKpiThresholdValue.class, thresholdId);
					thresholds.add(from(sbiThreshold));
				}
			}
		}

	}

	private void addValueToThresholdMap(Integer thresholdId, SbiKpiValue sbiKpiValue) {
		List<SbiKpiValue> lst = valueMap.get(thresholdId);
		if (lst == null) {
			valueMap.put(thresholdId, new ArrayList<SbiKpiValue>());
		}
		valueMap.get(thresholdId).add(sbiKpiValue);
	}

	private SbiAlertAction loadAction(Integer actionId, Session session) {
		if (!actionMap.containsKey(actionId)) {
			SbiAlertAction sbiAction = (SbiAlertAction) session.load(SbiAlertAction.class, actionId);
			actionMap.put(actionId, sbiAction);
		}
		return actionMap.get(actionId);
	}

	private void executeAction(Action action, Session session) throws SpagoBIException {
		if (hasValues(action)) {
			SbiAlertAction sbiAction = loadAction(action.getIdAction(), session);
			try {
				IAlertAction alertAction = (IAlertAction) Class.forName(sbiAction.getClassName()).newInstance();
				alertAction.execute(action.getJsonActionParameters());
			} catch (InstantiationException | IllegalAccessException | ClassNotFoundException e) {
				logger.error("Error executing action class[" + sbiAction.getClassName() + "]", e);
				throw new SpagoBIException("Error executing action class[" + sbiAction.getClassName() + "]", e);
			}
		}
	}

	private boolean hasValues(Action action) {
		for (Integer thresholdId : action.getThresholdValues()) {
			List<SbiKpiValue> values = valueMap.get(thresholdId);
			if (values != null && !values.isEmpty()) {
				return true;
			}
		}
		return false;
	}

	private ThresholdValue from(SbiKpiThresholdValue sbiValue) {
		ThresholdValue ret = new ThresholdValue();
		ret.setId(sbiValue.getId());
		ret.setIncludeMin('T' == sbiValue.getIncludeMin());
		ret.setIncludeMax('T' == sbiValue.getIncludeMax());
		ret.setMinValue(sbiValue.getMinValue());
		ret.setMaxValue(sbiValue.getMaxValue());
		return ret;
	}

	public static List<SbiKpiValue> loadResults(Integer id) {
		Session session = HibernateSessionManager.getCurrentSession();
		Date lastTimeRun = (Date) session.createCriteria(SbiKpiValue.class).add(Restrictions.eq("kpiId", id)).setProjection(Projections.max("timeRun"))
				.uniqueResult();
		List<SbiKpiValue> lst = null;
		if (lastTimeRun != null) {
			lst = session.createCriteria(SbiKpiValue.class).add(Restrictions.eq("kpiId", id)).add(Restrictions.eq("timeRun", lastTimeRun)).list();
		}
		session.close();
		return lst;
	}

	private Integer selectThreshold(SbiKpiValue kpiValue) {
		for (ThresholdValue threshold : thresholds) {
			double value = kpiValue.getComputedValue();
			boolean minValueOk = threshold.getMinValue() == null || value > threshold.getMinValue().doubleValue() || threshold.isIncludeMin()
					&& value == threshold.getMinValue().doubleValue();
			boolean maxValueOk = threshold.getMaxValue() == null || value < threshold.getMaxValue().doubleValue() || threshold.isIncludeMax()
					&& value == threshold.getMaxValue().doubleValue();
			if (minValueOk && maxValueOk) {
				return threshold.getId();
			}
		}
		return null;
	}
}

class InputParameter {
	private Kpi kpi;
	private List<Action> actions;

	public Kpi getKpi() {
		return kpi;
	}

	public void setKpi(Kpi kpi) {
		this.kpi = kpi;
	}

	public List<Action> getActions() {
		return actions;
	}

	public void setActions(List<Action> actions) {
		this.actions = actions;
	}

}

class Action {
	private Integer idAction;
	private List<Integer> thresholdValues;
	private String jsonActionParameters;

	public Integer getIdAction() {
		return idAction;
	}

	public void setIdAction(Integer idAction) {
		this.idAction = idAction;
	}

	public List<Integer> getThresholdValues() {
		return thresholdValues;
	}

	public void setThresholdValues(List<Integer> thresholdValues) {
		this.thresholdValues = thresholdValues;
	}

	public String getJsonActionParameters() {
		return jsonActionParameters;
	}

	public void setJsonActionParameters(String jsonActionParameters) {
		this.jsonActionParameters = jsonActionParameters;
	}

}
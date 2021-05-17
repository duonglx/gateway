package org.assimbly.gateway.web.rest;

import io.swagger.annotations.ApiParam;
import org.assimbly.gateway.config.ApplicationProperties;
import org.assimbly.gateway.config.EncryptionProperties;
import org.assimbly.gateway.config.environment.DBConfiguration;
import org.assimbly.gateway.config.scheduling.ExportConfigJob;
import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.repository.GatewayRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.GatewayService;
import org.assimbly.gateway.service.dto.GatewayDTO;

import javax.annotation.PostConstruct;
import org.assimbly.connector.Connector;
import org.assimbly.connectorrest.ConnectorResource;

import io.github.jhipster.web.util.ResponseUtil;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.quartz.impl.matchers.GroupMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import static org.quartz.CronScheduleBuilder.cronSchedule;


/**
 * REST controller for managing Gateway.
 */
@RestController
@RequestMapping("/api")
public class GatewayResource {

    private ConnectorResource connectorResource;

    @Autowired
    private DBConfiguration DBConfiguration;

    @Autowired
    FlowRepository flowRepository;

    @Autowired
    EncryptionProperties encryptionProperties;

    private final Logger log = LoggerFactory.getLogger(GatewayResource.class);

    private final ApplicationProperties applicationProperties;

    private Connector connector;

    private boolean connectorIsStarting = false;

    private static final String ENTITY_NAME = "gateway";

    private final GatewayRepository gatewayRepository;

	private final GatewayService gatewayService;
    private Scheduler scheduler;
	private String gatewayType;
	private boolean ran = false;

    public GatewayResource(GatewayService gatewayService, GatewayRepository gatewayRepository, ApplicationProperties applicationProperties, ConnectorResource connectorResource) throws SchedulerException {
        this.gatewayService = gatewayService;
        this.gatewayRepository = gatewayRepository;
        this.applicationProperties = applicationProperties;
        this.connectorResource = connectorResource;
    }


    /**
     * POST  /gateways : Create a new gateway.
     *
     * @param gatewayDTO the gatewayDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new gatewayDTO, or with status 400 (Bad Request) if the gateway has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/gateways")
    public ResponseEntity<GatewayDTO> createGateway(@RequestBody GatewayDTO gatewayDTO) throws URISyntaxException {
        log.debug("REST request to save Gateway : {}", gatewayDTO);
        if (gatewayDTO.getId() != null) {
            throw new BadRequestAlertException("A new gateway cannot already have an ID", ENTITY_NAME, "idexists");
        }
        GatewayDTO result = gatewayService.save(gatewayDTO);
        return ResponseEntity.created(new URI("/api/gateways/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /gateways : Updates an existing gateway.
     *
     * @param gatewayDTO the gatewayDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated gatewayDTO,
     * or with status 400 (Bad Request) if the gatewayDTO is not valid,
     * or with status 500 (Internal Server Error) if the gatewayDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/gateways")
    public ResponseEntity<GatewayDTO> updateGateway(@RequestBody GatewayDTO gatewayDTO) throws URISyntaxException {

    	log.debug("REST request to update Gateway : {}", gatewayDTO);
        if (gatewayDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        gatewayType = gatewayDTO.getType().name();
        GatewayDTO result = gatewayService.save(gatewayDTO);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, gatewayDTO.getId().toString()))
            .body(result);
    }

    private boolean isCreated(String groupName) throws SchedulerException {
        for (String name : scheduler.getJobGroupNames()) {
            if(name.equals(groupName))
                return true;
        }
        return false;
    }

    private JobKey getJobKey(String name) throws SchedulerException {
        for (String groupName : scheduler.getJobGroupNames()) {
            for (JobKey jobKey : scheduler.getJobKeys(GroupMatcher.jobGroupEquals(groupName))) {
                if (name.equals(jobKey.getName())) {
                    return jobKey;
                }
            }
        }
        return null;
    }

    private void scheduleJob(Trigger trigger, int gatewayid, String url) throws SchedulerException {
        if (isCreated("" + gatewayid))
            scheduler.deleteJob(getJobKey("" + gatewayid));
        scheduler.getContext().put("gatewayid", gatewayid);
        scheduler.getContext().put("database", DBConfiguration);
        scheduler.getContext().put("url", url);
        scheduler.scheduleJob(JobBuilder.newJob(ExportConfigJob.class).withIdentity("" + gatewayid, "" + gatewayid).build(), trigger);
    }

    /**
     * POST  /updatebackup : updates the backup frequency
     *
     * @param gatewayid
     * @return the ResponseEntity with status 200 (Successful) and status 400 (Bad Request) if the stopping connector failed
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(path = "/gateways/{gatewayid}/updatebackup/{frequency}", consumes = {"text/plain","application/xml", "application/json"}, produces = {"text/plain","application/xml","application/json"})
    public ResponseEntity<String> updateBackup(@ApiParam(hidden = true) @RequestHeader("Accept") String mediaType, @PathVariable Long gatewayid, @PathVariable String frequency, @RequestBody String url) throws Exception {
        if(!ran) {
            scheduler = StdSchedulerFactory.getDefaultScheduler();
            scheduler.start();
            ran = true;
        }
        switch (frequency) {
            case "Daily":
                scheduleJob(TriggerBuilder.newTrigger().withIdentity("" + gatewayid).withSchedule(cronSchedule("0 0 10 ? * MON-FRI *")).build(), Math.toIntExact(gatewayid), url);
                break;
            case "Weekly":
                scheduleJob(TriggerBuilder.newTrigger().withIdentity("" + gatewayid).withSchedule(cronSchedule("0 0 10 ? * MON *")).build(), Math.toIntExact(gatewayid), url);
                break;
            case "Monthly":
                scheduleJob(TriggerBuilder.newTrigger().withIdentity("" + gatewayid).withSchedule(cronSchedule("0 0 10 1 1/1 ? *")).build(), Math.toIntExact(gatewayid), url);
                break;
            default:
                if (isCreated("" + gatewayid))
                    scheduler.deleteJob(getJobKey("" + gatewayid));
                break;
            }
        return org.assimbly.gateway.web.rest.util.ResponseUtil.createSuccessResponse(gatewayid, mediaType, "/gateways/{gatewayid}/updatebackup/{frequency}", "Backup frequency updated");
    }

    /**
     * GET  /gateways : get all the gateways.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of gateways in body
     */
    @GetMapping("/gateways")
    public List<GatewayDTO> getAllGateways() {
        log.debug("REST request to get all Gateways");
        return gatewayService.findAll();
    }

    /**
     * GET  /gateways/:id : get the "id" gateway.
     *
     * @param id the id of the gatewayDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the gatewayDTO, or with status 404 (Not Found)
     */
    @GetMapping("/gateways/{id}")
    public ResponseEntity<GatewayDTO> getGateway(@PathVariable Long id) {
        log.error("Runs..");
        log.debug("Runs...");
        log.debug("REST request to get Gateway : {}", id);
        Optional<GatewayDTO> gatewayDTO = gatewayService.findOne(id);
        return ResponseUtil.wrapOrNotFound(gatewayDTO);
    }

    /**
     * DELETE  /gateways/:id : delete the "id" gateway.
     *
     * @param id the id of the gatewayDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/gateways/{id}")
    public ResponseEntity<Void> deleteGateway(@PathVariable Long id) {
        log.debug("REST request to delete Gateway : {}", id);

        gatewayRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    public void init() throws Exception {

        connector = connectorResource.getConnector();

        if(!connector.isStarted() && !connectorIsStarting){
            try {

                ApplicationProperties.Gateway gateway = applicationProperties.getGateway();

                String applicationBaseDirectory = gateway.getBaseDirectory();
                boolean applicationTracing = gateway.getTracing();
                boolean applicationDebugging = gateway.getDebugging();

                if (!applicationBaseDirectory.equals("default")) {
                    connector.setBaseDirectory(applicationBaseDirectory);
                }

                connectorIsStarting = true;
                connector.setEncryptionProperties(encryptionProperties.getProperties());
                //connector.addEventNotifier(failureListener);
                connector.setTracing(applicationTracing);
                connector.setDebugging(applicationDebugging);

                connector.start();

                int count = 1;

                while (!connector.isStarted() && count < 300) {
                    Thread.sleep(100);
                    count++;
                }

                connectorIsStarting = false;

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


    @PostConstruct
    private void initConnector() {

        try {
            init();
        } catch (Exception e) {
            log.error("Initialization of connector failed");
            e.printStackTrace();
        }

        //start flows with autostart
        List<Flow> flows = flowRepository.findAll();

        try {
            for(Flow flow : flows) {
                if(flow.isAutoStart()) {
                    String configuration;
                    log.info("Autostart flow " + flow.getName() + " with id=" + flow.getId());
                    configuration = DBConfiguration.convertDBToFlowConfiguration(flow.getId(),"xml/application",true);
                    connector.setFlowConfiguration(flow.getId().toString(),"application/xml", configuration);
                    connector.startFlow(flow.getId().toString());
                }
            }
        } catch (Exception e) {
            log.error("Autostart of flow failed (check configuration)");
            e.printStackTrace();
        }

    }

}

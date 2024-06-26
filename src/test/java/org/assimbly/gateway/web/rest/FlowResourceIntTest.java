package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.GatewayApp;

import org.assimbly.gateway.domain.Flow;
import org.assimbly.gateway.repository.FlowRepository;
import org.assimbly.gateway.service.FlowService;
import org.assimbly.gateway.service.dto.FlowDTO;
import org.assimbly.gateway.service.mapper.FlowMapper;
import org.assimbly.gateway.web.rest.errors.ExceptionTranslator;

import org.assimbly.gateway.web.rest.integration.FlowResource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.util.List;


import static org.assimbly.gateway.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the FlowResource REST controller.
 *
 * @see FlowResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = GatewayApp.class)
public class FlowResourceIntTest {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final Boolean DEFAULT_AUTO_START = false;
    private static final Boolean UPDATED_AUTO_START = true;

    private static final Boolean DEFAULT_OFF_LOADING = false;
    private static final Boolean UPDATED_OFF_LOADING = true;

    private static final Integer DEFAULT_MAXIMUM_REDELIVERIES = 1;
    private static final Integer UPDATED_MAXIMUM_REDELIVERIES = 2;

    private static final Integer DEFAULT_REDELIVERY_DELAY = 1;
    private static final Integer UPDATED_REDELIVERY_DELAY = 2;

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final Boolean DEFAULT_LOAD_BALANCING = false;
    private static final Boolean UPDATED_LOAD_BALANCING = true;

    private static final Integer DEFAULT_INSTANCES = 1;
    private static final Integer UPDATED_INSTANCES = 2;

    @Autowired
    private FlowRepository flowRepository;

    @Autowired
    private FlowMapper flowMapper;

    @Autowired
    private FlowService flowService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Autowired
    private Validator validator;

    private MockMvc restFlowMockMvc;

    private Flow flow;

    /*
    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final FlowResource flowResource = new FlowResource(flowService);
        this.restFlowMockMvc = MockMvcBuilders.standaloneSetup(flowResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

     */

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Flow createEntity(EntityManager em) {
        Flow flow = new Flow()
            .name(DEFAULT_NAME)
            .autoStart(DEFAULT_AUTO_START)
            .maximumRedeliveries(DEFAULT_MAXIMUM_REDELIVERIES)
            .redeliveryDelay(DEFAULT_REDELIVERY_DELAY)
            .type(DEFAULT_TYPE)
            .loadBalancing(DEFAULT_LOAD_BALANCING)
            .instances(DEFAULT_INSTANCES);
        return flow;
    }

    @Before
    public void initTest() {
        flow = createEntity(em);
    }

    @Test
    @Transactional
    public void createFlow() throws Exception {
        int databaseSizeBeforeCreate = flowRepository.findAll().size();

        // Create the Flow
        FlowDTO flowDTO = flowMapper.toDto(flow);
        restFlowMockMvc.perform(post("/api/flows")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(flowDTO)))
            .andExpect(status().isCreated());

        // Validate the Flow in the database
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeCreate + 1);
        Flow testFlow = flowList.get(flowList.size() - 1);
        assertThat(testFlow.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testFlow.isAutoStart()).isEqualTo(DEFAULT_AUTO_START);
        assertThat(testFlow.getMaximumRedeliveries()).isEqualTo(DEFAULT_MAXIMUM_REDELIVERIES);
        assertThat(testFlow.getRedeliveryDelay()).isEqualTo(DEFAULT_REDELIVERY_DELAY);
        assertThat(testFlow.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testFlow.isLoadBalancing()).isEqualTo(DEFAULT_LOAD_BALANCING);
        assertThat(testFlow.getInstances()).isEqualTo(DEFAULT_INSTANCES);
    }

    @Test
    @Transactional
    public void createFlowWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = flowRepository.findAll().size();

        // Create the Flow with an existing ID
        flow.setId(1L);
        FlowDTO flowDTO = flowMapper.toDto(flow);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFlowMockMvc.perform(post("/api/flows")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(flowDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Flow in the database
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllFlows() throws Exception {
        // Initialize the database
        flowRepository.saveAndFlush(flow);

        // Get all the flowList
        restFlowMockMvc.perform(get("/api/flows?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(flow.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].autoStart").value(hasItem(DEFAULT_AUTO_START.booleanValue())))
            .andExpect(jsonPath("$.[*].maximumRedeliveries").value(hasItem(DEFAULT_MAXIMUM_REDELIVERIES)))
            .andExpect(jsonPath("$.[*].redeliveryDelay").value(hasItem(DEFAULT_REDELIVERY_DELAY)))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].loadBalancing").value(hasItem(DEFAULT_LOAD_BALANCING.booleanValue())))
            .andExpect(jsonPath("$.[*].instances").value(hasItem(DEFAULT_INSTANCES)));
    }

    @Test
    @Transactional
    public void getFlow() throws Exception {
        // Initialize the database
        flowRepository.saveAndFlush(flow);

        // Get the flow
        restFlowMockMvc.perform(get("/api/flows/{id}", flow.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(flow.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.autoStart").value(DEFAULT_AUTO_START.booleanValue()))
            .andExpect(jsonPath("$.maximumRedeliveries").value(DEFAULT_MAXIMUM_REDELIVERIES))
            .andExpect(jsonPath("$.redeliveryDelay").value(DEFAULT_REDELIVERY_DELAY))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.loadBalancing").value(DEFAULT_LOAD_BALANCING.booleanValue()))
            .andExpect(jsonPath("$.instances").value(DEFAULT_INSTANCES));
    }

    @Test
    @Transactional
    public void getNonExistingFlow() throws Exception {
        // Get the flow
        restFlowMockMvc.perform(get("/api/flows/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFlow() throws Exception {
        // Initialize the database
        flowRepository.saveAndFlush(flow);

        int databaseSizeBeforeUpdate = flowRepository.findAll().size();

        // Update the flow
        Flow updatedFlow = flowRepository.findById(flow.getId()).get();
        // Disconnect from session so that the updates on updatedFlow are not directly saved in db
        em.detach(updatedFlow);
        updatedFlow
            .name(UPDATED_NAME)
            .autoStart(UPDATED_AUTO_START)
            .maximumRedeliveries(UPDATED_MAXIMUM_REDELIVERIES)
            .redeliveryDelay(UPDATED_REDELIVERY_DELAY)
            .type(UPDATED_TYPE)
            .loadBalancing(UPDATED_LOAD_BALANCING)
            .instances(UPDATED_INSTANCES);
        FlowDTO flowDTO = flowMapper.toDto(updatedFlow);

        restFlowMockMvc.perform(put("/api/flows")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(flowDTO)))
            .andExpect(status().isOk());

        // Validate the Flow in the database
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeUpdate);
        Flow testFlow = flowList.get(flowList.size() - 1);
        assertThat(testFlow.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFlow.isAutoStart()).isEqualTo(UPDATED_AUTO_START);
        assertThat(testFlow.getMaximumRedeliveries()).isEqualTo(UPDATED_MAXIMUM_REDELIVERIES);
        assertThat(testFlow.getRedeliveryDelay()).isEqualTo(UPDATED_REDELIVERY_DELAY);
        assertThat(testFlow.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testFlow.isLoadBalancing()).isEqualTo(UPDATED_LOAD_BALANCING);
        assertThat(testFlow.getInstances()).isEqualTo(UPDATED_INSTANCES);
    }

    @Test
    @Transactional
    public void updateNonExistingFlow() throws Exception {
        int databaseSizeBeforeUpdate = flowRepository.findAll().size();

        // Create the Flow
        FlowDTO flowDTO = flowMapper.toDto(flow);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFlowMockMvc.perform(put("/api/flows")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(flowDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Flow in the database
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteFlow() throws Exception {
        // Initialize the database
        flowRepository.saveAndFlush(flow);

        int databaseSizeBeforeDelete = flowRepository.findAll().size();

        // Get the flow
        restFlowMockMvc.perform(delete("/api/flows/{id}", flow.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Flow> flowList = flowRepository.findAll();
        assertThat(flowList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Flow.class);
        Flow flow1 = new Flow();
        flow1.setId(1L);
        Flow flow2 = new Flow();
        flow2.setId(flow1.getId());
        assertThat(flow1).isEqualTo(flow2);
        flow2.setId(2L);
        assertThat(flow1).isNotEqualTo(flow2);
        flow1.setId(null);
        assertThat(flow1).isNotEqualTo(flow2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(FlowDTO.class);
        FlowDTO flowDTO1 = new FlowDTO();
        flowDTO1.setId(1L);
        FlowDTO flowDTO2 = new FlowDTO();
        assertThat(flowDTO1).isNotEqualTo(flowDTO2);
        flowDTO2.setId(flowDTO1.getId());
        assertThat(flowDTO1).isEqualTo(flowDTO2);
        flowDTO2.setId(2L);
        assertThat(flowDTO1).isNotEqualTo(flowDTO2);
        flowDTO1.setId(null);
        assertThat(flowDTO1).isNotEqualTo(flowDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(flowMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(flowMapper.fromId(null)).isNull();
    }
}

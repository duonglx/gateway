package org.assimbly.gateway.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.assimbly.gateway.domain.EnvironmentVariables;

import org.assimbly.gateway.repository.EnvironmentVariablesRepository;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.EnvironmentVariablesDTO;
import org.assimbly.gateway.service.mapper.EnvironmentVariablesMapper;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing EnvironmentVariables.
 */
@RestController
@RequestMapping("/api")
public class EnvironmentVariablesResource {

    private final Logger log = LoggerFactory.getLogger(EnvironmentVariablesResource.class);

    private static final String ENTITY_NAME = "environmentVariables";

    private final EnvironmentVariablesRepository environmentVariablesRepository;

    private final EnvironmentVariablesMapper environmentVariablesMapper;

    public EnvironmentVariablesResource(EnvironmentVariablesRepository environmentVariablesRepository, EnvironmentVariablesMapper environmentVariablesMapper) {
        this.environmentVariablesRepository = environmentVariablesRepository;
        this.environmentVariablesMapper = environmentVariablesMapper;
    }

    /**
     * POST  /environment-variables : Create a new environmentVariables.
     *
     * @param environmentVariablesDTO the environmentVariablesDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new environmentVariablesDTO, or with status 400 (Bad Request) if the environmentVariables has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/environment-variables")
    @Timed
    public ResponseEntity<EnvironmentVariablesDTO> createEnvironmentVariables(@RequestBody EnvironmentVariablesDTO environmentVariablesDTO) throws URISyntaxException {
        log.debug("REST request to save EnvironmentVariables : {}", environmentVariablesDTO);
        if (environmentVariablesDTO.getId() != null) {
            throw new BadRequestAlertException("A new environmentVariables cannot already have an ID", ENTITY_NAME, "idexists");
        }
        EnvironmentVariables environmentVariables = environmentVariablesMapper.toEntity(environmentVariablesDTO);
        environmentVariables = environmentVariablesRepository.save(environmentVariables);
        EnvironmentVariablesDTO result = environmentVariablesMapper.toDto(environmentVariables);
        return ResponseEntity.created(new URI("/api/environment-variables/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /environment-variables : Updates an existing environmentVariables.
     *
     * @param environmentVariablesDTO the environmentVariablesDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated environmentVariablesDTO,
     * or with status 400 (Bad Request) if the environmentVariablesDTO is not valid,
     * or with status 500 (Internal Server Error) if the environmentVariablesDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/environment-variables")
    @Timed
    public ResponseEntity<EnvironmentVariablesDTO> updateEnvironmentVariables(@RequestBody EnvironmentVariablesDTO environmentVariablesDTO) throws URISyntaxException {
        log.debug("REST request to update EnvironmentVariables : {}", environmentVariablesDTO);
        if (environmentVariablesDTO.getId() == null) {
            return createEnvironmentVariables(environmentVariablesDTO);
        }
        EnvironmentVariables environmentVariables = environmentVariablesMapper.toEntity(environmentVariablesDTO);
        environmentVariables = environmentVariablesRepository.save(environmentVariables);
        EnvironmentVariablesDTO result = environmentVariablesMapper.toDto(environmentVariables);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, environmentVariablesDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /environment-variables : get all the environmentVariables.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of environmentVariables in body
     */
    @GetMapping("/environment-variables")
    @Timed
    public List<EnvironmentVariablesDTO> getAllEnvironmentVariables() {
        log.debug("REST request to get all EnvironmentVariables");
        List<EnvironmentVariables> environmentVariables = environmentVariablesRepository.findAll();
        return environmentVariablesMapper.toDto(environmentVariables);
        }

    /**
     * GET  /environment-variables/:id : get the "id" environmentVariables.
     *
     * @param id the id of the environmentVariablesDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the environmentVariablesDTO, or with status 404 (Not Found)
     */
    @GetMapping("/environment-variables/{id}")
    @Timed
    public ResponseEntity<EnvironmentVariablesDTO> getEnvironmentVariables(@PathVariable Long id) {
        log.debug("REST request to get EnvironmentVariables : {}", id);
        EnvironmentVariables environmentVariables = environmentVariablesRepository.findOne(id);
        EnvironmentVariablesDTO environmentVariablesDTO = environmentVariablesMapper.toDto(environmentVariables);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(environmentVariablesDTO));
    }

    /**
     * DELETE  /environment-variables/:id : delete the "id" environmentVariables.
     *
     * @param id the id of the environmentVariablesDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/environment-variables/{id}")
    @Timed
    public ResponseEntity<Void> deleteEnvironmentVariables(@PathVariable Long id) {
        log.debug("REST request to delete EnvironmentVariables : {}", id);
        environmentVariablesRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
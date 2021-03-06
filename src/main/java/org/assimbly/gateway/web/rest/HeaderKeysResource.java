package org.assimbly.gateway.web.rest;

import org.assimbly.gateway.service.HeaderKeysService;
import org.assimbly.gateway.web.rest.errors.BadRequestAlertException;
import org.assimbly.gateway.web.rest.util.HeaderUtil;
import org.assimbly.gateway.service.dto.HeaderKeysDTO;
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
 * REST controller for managing HeaderKeys.
 */
@RestController
@RequestMapping("/api")
public class HeaderKeysResource {

    private final Logger log = LoggerFactory.getLogger(HeaderKeysResource.class);

    private static final String ENTITY_NAME = "headerKeys";

    private final HeaderKeysService headerKeysService;

    public HeaderKeysResource(HeaderKeysService headerKeysService) {
        this.headerKeysService = headerKeysService;
    }

    /**
     * POST  /header-keys : Create a new headerKeys.
     *
     * @param headerKeysDTO the headerKeysDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new headerKeysDTO, or with status 400 (Bad Request) if the headerKeys has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/header-keys")
    public ResponseEntity<HeaderKeysDTO> createHeaderKeys(@RequestBody HeaderKeysDTO headerKeysDTO) throws URISyntaxException {
        log.debug("REST request to save HeaderKeys : {}", headerKeysDTO);
        if (headerKeysDTO.getId() != null) {
            throw new BadRequestAlertException("A new headerKeys cannot already have an ID", ENTITY_NAME, "idexists");
        }
        HeaderKeysDTO result = headerKeysService.save(headerKeysDTO);
        return ResponseEntity.created(new URI("/api/header-keys/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /header-keys : Updates an existing headerKeys.
     *
     * @param headerKeysDTO the headerKeysDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated headerKeysDTO,
     * or with status 400 (Bad Request) if the headerKeysDTO is not valid,
     * or with status 500 (Internal Server Error) if the headerKeysDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/header-keys")
    public ResponseEntity<HeaderKeysDTO> updateHeaderKeys(@RequestBody HeaderKeysDTO headerKeysDTO) throws URISyntaxException {
        log.debug("REST request to update HeaderKeys : {}", headerKeysDTO);
        if (headerKeysDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        HeaderKeysDTO result = headerKeysService.save(headerKeysDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, headerKeysDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /header-keys : get all the headerKeys.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of headerKeys in body
     */
    @GetMapping("/header-keys")
    public List<HeaderKeysDTO> getAllHeaderKeys() {
        log.debug("REST request to get all HeaderKeys");
        return headerKeysService.findAll();
    }

    /**
     * GET  /header-keys/:id : get the "id" headerKeys.
     *
     * @param id the id of the headerKeysDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the headerKeysDTO, or with status 404 (Not Found)
     */
    @GetMapping("/header-keys/{id}")
    public ResponseEntity<HeaderKeysDTO> getHeaderKeys(@PathVariable Long id) {
        log.debug("REST request to get HeaderKeys : {}", id);
        Optional<HeaderKeysDTO> headerKeysDTO = headerKeysService.findOne(id);
        return ResponseUtil.wrapOrNotFound(headerKeysDTO);
    }

    /**
     * DELETE  /header-keys/:id : delete the "id" headerKeys.
     *
     * @param id the id of the headerKeysDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/header-keys/{id}")
    public ResponseEntity<Void> deleteHeaderKeys(@PathVariable Long id) {
        log.debug("REST request to delete HeaderKeys : {}", id);
        headerKeysService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}

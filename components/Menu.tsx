import React, { FC, useState } from 'react';
import { Nav, Navbar, Modal, Button, NavDropdown } from 'react-bootstrap';
import Image from 'next/image';
import { useLocale } from '../hooks/useLocale';
import PrivacyPolicy from '../components/PrivacyPolicy';

const Menu: FC = () => {
  const { t, locales, changeLocale } = useLocale();
  const [usageShowing, setUsageShowing] = useState(false);
  const [aboutShowing, setAboutShowing] = useState(false);

  const languages = locales.map(([locale, name]) => (
    <NavDropdown.Item key={locale} onClick={() => changeLocale(locale)}>
      {name}
    </NavDropdown.Item>
  ));

  return (
    <>
      <Navbar collapseOnSelect expand="lg">
        <Navbar.Brand>
          <Image
            src={'/world-flag-search/images/icons/icon-512x512.png'}
            width="30"
            height="30"
            title="icon"
            alt="icon"
            className="d-inline-block align-top"
          />{' '}
          {t.TITLE}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto"></Nav>
          <Nav>
            <Nav.Link onClick={() => setUsageShowing(true)}>{t.USAGE}</Nav.Link>
            <NavDropdown title={t.LANGUAGE} id="basic-nav-dropdown">
              {languages}
            </NavDropdown>
            <Nav.Link onClick={() => setAboutShowing(true)}>{t.ABOUT}</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Modal show={usageShowing} onHide={() => setUsageShowing(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t.USAGE}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t.USAGE_DESCRIPTION_1}</p>
          <p>{t.USAGE_DESCRIPTION_2}</p>
          <ul>
            <li>{t.USAGE_DESCRIPTION_3}</li>
            <li>{t.USAGE_DESCRIPTION_4}</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setUsageShowing(false)}>
            {t.CLOSE}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={aboutShowing} onHide={() => setAboutShowing(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t.ABOUT}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <dl>
            <dt>{t.ABOUT_DESCRIPTION_1}</dt>
            <dd>
              <a href="https://github.com/mame">Yusuke Endoh</a>
            </dd>
            <dt>{t.ABOUT_DESCRIPTION_2}</dt>
            <dd>
              <a href="https://github.com/mame/world-flag-search">
                GitHub: mame/world-flag-search
              </a>
            </dd>
          </dl>
          {PrivacyPolicy}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setAboutShowing(false)}>
            {t.CLOSE}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Menu;

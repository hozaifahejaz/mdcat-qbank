-- The AKU MBBS admission test (2026-27 brochure) has only Science Achievement and Science & Mathematics Reasoning,
-- with no English section, so English leaves the AKU bank. The questions themselves stay in the MDCAT and NUMS banks.
DELETE FROM bank_questions WHERE bank = 'aku' AND subject = 'English';

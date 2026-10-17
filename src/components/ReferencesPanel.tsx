import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, GraduationCap, ExternalLink } from 'lucide-react';

interface ReferencesPanelProps {}

export function ReferencesPanel({}: ReferencesPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'scientific',
      title: 'Scientific References',
      icon: BookOpen,
      references: [
        {
          authors: 'Lang, S.-D.',
          year: '1999',
          title: 'An extended banker\'s algorithm for deadlock avoidance',
          journal: 'IEEE Transactions on Software Engineering',
          volume: '25',
          issue: '3',
          pages: '428–432',
          doi: '10.1109/32.798330',
        },
      ],
    },
    {
      id: 'educational',
      title: 'Educational Resources',
      icon: GraduationCap,
      resources: [
        {
          name: 'Operating System Concepts',
          authors: 'Silberschatz, Galvin, and Gagne',
          description: 'Textbook covering Mutual Exclusion, Hold and Wait, RAGs, and the Banker\'s Algorithm.',
        },
        {
          name: 'Yale University CS - Chapter 7: Deadlocks',
          description: 'Comprehensive course materials on deadlock concepts and handling.',
        },
        {
          name: 'University of Virginia CS3130 - Deadlock',
          description: 'Course materials covering the Coffman Conditions (four necessary deadlock conditions).',
        },
        {
          name: 'TutorialsPoint - Operating System Resource Allocation Graph',
          description: 'Detailed examples of single-instance and multi-instance Resource Allocation Graphs.',
        },
      ],
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        References and Resources
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Scientific references and educational resources for further learning about deadlock concepts and handling strategies.
      </p>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-resource overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(section.id)}
              className="w-full p-4 text-left flex items-center justify-between"
              aria-expanded={expandedSection === section.id}
            >
              <div className="flex items-center gap-3">
                <section.icon size={20} className="text-resource flex-shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {section.title}
                </h4>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp size={20} className="text-process flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown size={20} className="text-process flex-shrink-0 ml-2" />
              )}
            </button>

            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4"
                >
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    {section.id === 'scientific' && section.references && (
                      <div className="space-y-4">
                        {section.references.map((ref, i) => (
                          <div key={i} className="text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-semibold">
                              {ref.authors} ({ref.year}). {ref.title}.
                            </p>
                            <p className="italic">
                              {ref.journal}, {ref.volume}({ref.issue}), {ref.pages}.
                            </p>
                            <p className="text-xs text-process mt-1">
                              DOI: {ref.doi}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.id === 'educational' && section.resources && (
                      <div className="space-y-4">
                        {section.resources.map((resource, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500"
                          >
                            <div className="flex items-start gap-2">
                              <ExternalLink size={16} className="text-process flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                  {resource.name}
                                </h5>
                                {resource.authors && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {resource.authors}
                                  </p>
                                )}
                                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                                  {resource.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-process/10 border border-process rounded-lg"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Learning Path:</strong> Start with the textbook (Operating System Concepts) for foundational knowledge, then explore university course materials for deeper understanding. The scientific paper provides advanced algorithm details.
        </p>
      </motion.div>
    </div>
  );
}
